import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp, isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register', '/index', '/merchant/register']

// ✅ 防止路由守卫重复执行的标记
let isCheckingMerchant = false

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  if (getToken()) {
    // 已登录用户
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/index' })
      NProgress.done()
    } else {
      // 已登录用户需要检查角色，即使是白名单路径也要检查
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        try {
          // 判断当前用户是否已拉取完user_info信息
          await useUserStore().getInfo()
          isRelogin.show = false
          const accessRoutes = await usePermissionStore().generateRoutes()
          
          // 根据roles权限生成可访问的路由表
          accessRoutes.forEach(route => {
            if (!isHttp(route.path)) {
              router.addRoute(route) // 动态添加可访问路由表
            }
          })
          
          // 获取用户角色
          const userRoles = useUserStore().roles
          const isAdmin = userRoles.some(role => role === 'admin' || role === 'ROLE_ADMIN')
          const isMerchant = userRoles.some(role => role === 'merchant' || role === 'ROLE_MERCHANT')
          
          // 添加路由后,根据角色决定首次登录的跳转路径
          // 只有从登录页跳转过来时才进行角色重定向
          if (from.path === '/login') {
            if (isAdmin && to.path === '/index') {
              // 管理员从登录页访问/index,重定向到/dashboard
              next({ path: '/dashboard', replace: true })
            } else if (!isAdmin && to.path === '/dashboard') {
              // 非管理员从登录页访问/dashboard,重定向到/index
              next({ path: '/index', replace: true })
            } else {
              // 其他情况,正常跳转
              next()
            }
          } else {
            // 非登录页跳转(如刷新页面、手动导航)
            // 需要重新导航以确保动态路由已注册
            next({ ...to, replace: true })
          }
        } catch (err) {
          await useUserStore().logOut()
          ElMessage.error(err)
          next({ path: '/login' })
        }
      } else {
        // 已有用户信息和路由,检查商户登记状态
        const userRoles = useUserStore().roles
        const isMerchant = userRoles.some(role => role === 'merchant' || role === 'ROLE_MERCHANT')
        
        // 🔒 权限控制:商户用户不能访问纯管理员功能页面
        // 注意：/biz/merchant 是商户和管理员都可以访问的，只是显示的数据不同
        // /biz/merchantAudit 是只有管理员才能访问的审核功能
        const adminOnlyPaths = ['/biz/merchantAudit']
        const isAdminOnlyPage = adminOnlyPaths.some(path => to.path.startsWith(path))
        
        if (isMerchant && isAdminOnlyPage) {
          console.log('🚫 商户用户尝试访问管理员专属页面:', to.path)
          ElMessage.warning('您无权访问此页面')
          next({ path: '/index', replace: true })
          return
        }
              
        // ✅ 如果是商户用户且访问商户管理页面，需要实时检查商户登记状态
        const isMerchantPage = to.path.startsWith('/biz/merchant') && !to.path.startsWith('/biz/merchantAudit')
        
        if (isMerchant && isMerchantPage) {
          // ✅ 防止重复检查导致死循环
          if (isCheckingMerchant) {
            next()
            return
          }
          
          isCheckingMerchant = true
          
          try {
            // 获取当前用户ID
            const currentUserId = useUserStore().id || useUserStore().userId
            
            // 动态导入API模块
            const { getMyMerchant, listMerchant } = await import('@/api/biz/merchant')
            
            const response = await getMyMerchant()
            let merchantInfo = response.data
            
            // ✅ 关键安全检查：验证商户归属
            if (merchantInfo && currentUserId && merchantInfo.userId !== currentUserId) {
              console.error('商户归属不匹配！')
              merchantInfo = null // 视为未登记
            }
            
            // 如果没有找到商户信息，尝试从列表查询
            if (!merchantInfo) {
              try {
                const listResponse = await listMerchant({
                  pageNum: 1,
                  pageSize: 10
                })
                
                if (listResponse.data && listResponse.data.list && listResponse.data.list.length > 0) {
                  // ✅ 关键：查找属于当前用户的商户
                  const myMerchant = listResponse.data.list.find(
                    merchant => merchant.userId === currentUserId
                  )
                  
                  if (myMerchant) {
                    merchantInfo = myMerchant
                  }
                }
              } catch (listError) {
                // 列表查询失败不影响主流程，继续判断
              }
            }
            
            // 判断是否有商户信息
            if (!merchantInfo) {
              ElMessage.warning('您还未完成商户信息登记，请先完善商户信息')
              isCheckingMerchant = false // ✅ 清除标记
              next({ path: '/merchant/register', replace: true })
              return
            }
            
            // 检查审核状态
            const auditStatus = merchantInfo.auditStatus
            
            if (auditStatus === '0' || auditStatus === 0) {
              // 待审核
              ElMessage.info('您的商户信息正在审核中，请耐心等待')
              isCheckingMerchant = false // ✅ 清除标记
              next() // 允许进入，但显示提示信息
              return
            } else if (auditStatus === '2' || auditStatus === 2) {
              // 审核驳回
              ElMessage.warning(`您的商户信息审核未通过\n驳回原因：${merchantInfo.rejectReason || '未知'}`)
              isCheckingMerchant = false // ✅ 清除标记
              next({ path: '/merchant/register', replace: true })
              return
            } else if (auditStatus === '1' || auditStatus === 1) {
              // 审核通过
              isCheckingMerchant = false // ✅ 清除标记
              next()
              return
            } else {
              // 未知状态
              ElMessage.warning('商户状态异常，请联系管理员')
              isCheckingMerchant = false // ✅ 清除标记
              next({ path: '/index', replace: true })
              return
            }
          } catch (error) {
            console.error('检查商户登记状态失败:', error.message)
            // API失败时容错放行，让页面自己处理
            isCheckingMerchant = false // ✅ 清除标记
            next()
            return
          }
        }
              
        next()
      }
    }
  } else {
    // 没有token(未登录用户)
    if (isWhiteList(to.path)) {
      // 允许访问白名单页面(游客模式)
      next()
    } else {
      // 访问其他页面需要登录,重定向到登录页
      next(`/login?redirect=${to.fullPath}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

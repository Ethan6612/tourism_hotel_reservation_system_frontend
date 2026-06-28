import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register', '/index', '/search', '/merchant/register', '/merchant/pending']

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
      const roles = useUserStore().roles
      const isAdmin = roles.some(r => r === 'admin' || r === 'ROLE_ADMIN')
      const isMerchant = roles.some(r => r === 'merchant' || r === 'ROLE_MERCHANT')
      next({ path: (isAdmin || isMerchant) ? '/dashboard' : '/home' })
      NProgress.done()
    } else {
      // 已登录用户需要检查角色，即使是白名单路径也要检查
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        try {
          // 判断当前用户是否已拉取完user_info信息
          await useUserStore().getInfo()
          isRelogin.show = false
          // ✅ generateRoutes() 内部已自动将动态路由注册到router
          await usePermissionStore().generateRoutes()
          
          // 获取用户角色
          const userRoles = useUserStore().roles
          const isAdmin = userRoles.some(role => role === 'admin' || role === 'ROLE_ADMIN')
          const isMerchant = userRoles.some(role => role === 'merchant' || role === 'ROLE_MERCHANT')
          
          // 管理员→控制台，商家→商户中心，普通用户→主页
          if (from.path === '/login') {
            if (isAdmin && (to.path === '/index' || to.path === '/home')) {
              next({ path: '/dashboard', replace: true })
            } else if (isMerchant && (to.path === '/index' || to.path === '/home')) {
              next({ path: '/biz/merchant', replace: true })
            } else if (!isAdmin && !isMerchant && to.path === '/dashboard') {
              next({ path: '/home', replace: true })
            } else {
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
        const isAdmin = userRoles.some(role => role === 'admin' || role === 'ROLE_ADMIN')
        const isMerchant = userRoles.some(role => role === 'merchant' || role === 'ROLE_MERCHANT')
        
        // 🔒 管理员不能访问前台主页，重定向到控制台
        if (isAdmin && (to.path === '/index' || to.path === '/home')) {
          next({ path: '/dashboard', replace: true })
          return
        }

        // 🔒 商户用户不能访问前台主页，重定向到商户中心
        if (isMerchant && (to.path === '/index' || to.path === '/home')) {
          next({ path: '/biz/merchant', replace: true })
          return
        }

        // 🔒 普通用户访问 /index 时重定向到 /home（用户主页）
        if (!isAdmin && !isMerchant && to.path === '/index') {
          next({ path: '/home', replace: true })
          return
        }

        // 🔒 权限控制:商户用户不能访问纯管理员功能页面
        // 注意：/biz/merchant 是商户和管理员都可以访问的，只是显示的数据不同
        // /biz/merchantAudit 是只有管理员才能访问的审核功能
        const adminOnlyPaths = ['/biz/merchantAudit']
        const isAdminOnlyPage = adminOnlyPaths.some(path => to.path.startsWith(path))
        
        if (isMerchant && isAdminOnlyPage) {
          console.log('🚫 商户用户尝试访问管理员专属页面:', to.path)
          ElMessage.warning('您无权访问此页面')
          next({ path: '/dashboard', replace: true })
          return
        }
              
        // ✅ 商户用户访问任何 /biz/* 管理页面或 /dashboard 时，都需要实时检查商户登记状态
        // 排除：/biz/merchantAudit（管理员专属）、/merchant/register（注册页已在白名单）
        const isMerchantBizPage = to.path.startsWith('/biz/') &&
          !to.path.startsWith('/biz/merchantAudit')

        if (isMerchant && (isMerchantBizPage || to.path === '/dashboard') && !isAdmin) {
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

            // 🔴 未注册商户资料 → 跳转到注册页
            if (!merchantInfo) {
              ElMessage.warning('未找到关联的商户信息，请先完成商户注册')
              isCheckingMerchant = false
              next({ path: '/merchant/register', replace: true })
              return
            }

            // 检查审核状态
            const auditStatus = merchantInfo.auditStatus

            if (auditStatus === '0' || auditStatus === 0) {
              // 🟡 待审核 → 只能查看商户主页，其他管理页面暂不可用
              if (to.path === '/biz/merchant') {
                // 允许进入商户主页（可查看和修改注册信息）
                isCheckingMerchant = false
                next()
                return
              }
              // 其他 /biz/* 页面重定向到商户主页
              ElMessage.info('您的商户信息正在审核中，审核通过后方可使用全部功能')
              isCheckingMerchant = false
              next({ path: '/biz/merchant', replace: true })
              return
            } else if (auditStatus === '2' || auditStatus === 2) {
              // 🔴 审核驳回 → 跳转到注册页重新提交
              ElMessage.warning(`您的商户信息审核未通过\n驳回原因：${merchantInfo.rejectReason || '未知'}`)
              isCheckingMerchant = false
              next({ path: '/merchant/register', replace: true })
              return
            } else if (auditStatus === '1' || auditStatus === 1) {
              // 🟢 审核通过 → 允许进入
              isCheckingMerchant = false
              next()
              return
            } else {
              // 未知状态
              ElMessage.warning('商户状态异常，请联系管理员')
              isCheckingMerchant = false
              next({ path: '/dashboard', replace: true })
              return
            }
          } catch (error) {
            console.error('检查商户登记状态失败:', error.message)
            // API失败时容错：提示用户稍后重试，不直接放行
            ElMessage.error('获取商户信息失败，请稍后重试')
            isCheckingMerchant = false
            next({ path: '/dashboard', replace: true })
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

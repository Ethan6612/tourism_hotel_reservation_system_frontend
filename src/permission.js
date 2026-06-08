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

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach((to, from, next) => {
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
        // 判断当前用户是否已拉取完user_info信息
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
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
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/login' })
          })
        })
      } else {
        // 已有用户信息和路由,检查商户登记状态
        const userRoles = useUserStore().roles
        const isMerchant = userRoles.some(role => role === 'merchant' || role === 'ROLE_MERCHANT')
              
        // 如果是商户用户且未完成登记
        if (isMerchant && !localStorage.getItem('merchantRegistered')) {
          // 允许访问登记页面和主页,其他页面提示登记
          if (to.path !== '/merchant/register' && to.path !== '/index' && to.path !== '/') {
            ElMessage.warning('您还未完成商户信息登记,请先完善商户信息')
            next({ path: '/merchant/register', replace: true })
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

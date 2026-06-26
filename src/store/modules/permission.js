import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'
import useUserStore from '@/store/modules/user'
import { h } from 'vue'

// 匹配views里面所有的.vue文件 - 使用绝对路径模式
const modules = import.meta.glob('/src/views/**/*.vue')

// 动态加载视图组件
function loadView(view) {
  // view格式如: 'biz/merchant/index' 或 'system/user/index'
  // 转换为绝对路径: '/src/views/biz/merchant/index.vue'
  const path = `/src/views/${view}.vue`
  
  // 从 modules 中查找匹配的组件
  if (modules[path]) {
    if (import.meta.env.DEV) {
      
    }
    return modules[path]
  }
  
  // 如果找不到，尝试其他可能的路径格式
  if (import.meta.env.DEV) {

  }
  
  // 尝试不带 .vue 后缀的路径（某些情况下可能需要）
  const altPath = `/src/views/${view}`
  if (modules[altPath]) {
    if (import.meta.env.DEV) {

    }
    return modules[altPath]
  }
  
  // 尝试相对路径格式（作为最后的备选）
  const relPath = `./../../views/${view}.vue`
  if (modules[relPath]) {
    if (import.meta.env.DEV) {

    }
    return modules[relPath]
  }
  
  if (import.meta.env.DEV) {

  }
  
  // 如果都找不到，返回一个错误提示组件
  return () => Promise.resolve({
    render() {
      return h('div', { style: { padding: '20px', color: 'red' } }, 
        `组件加载失败: ${view}`)
    }
  })
}

const usePermissionStore = defineStore(
  'permission',
  {
    state: () => ({
      routes: [],
      addRoutes: [],
      defaultRoutes: [],
      topbarRouters: [],
      sidebarRouters: []
    }),
    actions: {
      setRoutes(routes) {
        this.addRoutes = routes
        this.routes = constantRoutes.concat(routes)
      },
      setDefaultRoutes(routes) {
        this.defaultRoutes = constantRoutes.concat(routes)
      },
      setTopbarRoutes(routes) {
        this.topbarRouters = routes
      },
      setSidebarRouters(routes) {
        this.sidebarRouters = routes
      },
      // 清除路由
      clearRoutes() {
        this.routes = []
        this.addRoutes = []
        this.defaultRoutes = []
        this.topbarRouters = []
        this.sidebarRouters = []
        // 移除所有动态添加的路由
        router.getRoutes().forEach(route => {
          if (route.name && !constantRoutes.find(r => r.name === route.name)) {
            router.removeRoute(route.name)
          }
        })
      },
      generateRoutes(roles) {
        return new Promise(resolve => {
          // 向后端请求路由数据
          getRouters().then(res => {
            let rawData = JSON.parse(JSON.stringify(res.data))

            // 管理员角色屏蔽商家专属菜单（必须在 filterAsyncRouter 之前，此时 component 还是字符串）
            const userRoles = useUserStore().roles
            const isAdmin = userRoles.some(r => r === 'admin' || r === 'ROLE_ADMIN')
            if (isAdmin) {
              rawData = filterMerchantMenus(rawData)
            }

            const sdata = JSON.parse(JSON.stringify(rawData))
            const rdata = JSON.parse(JSON.stringify(rawData))
            const defaultData = JSON.parse(JSON.stringify(rawData))
            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)

            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            asyncRoutes.forEach(route => { router.addRoute(route) })
            this.setRoutes(rewriteRoutes)
            
            // 过滤constantRoutes中带有roles限制的路由
            const filteredConstantRoutes = filterConstantRoutesByRole(constantRoutes)
            
            const finalSidebarRoutes = filteredConstantRoutes.concat(sidebarRoutes)
            
            this.setSidebarRouters(finalSidebarRoutes)
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)
            
            resolve(rewriteRoutes)
          })
        })
      }
    }
  })

// 商家专属组件路径，管理员侧边栏需屏蔽
const MERCHANT_ONLY_COMPONENTS = [
  'biz/hotel/index',
  'biz/room/index',
  'biz/statistics/index',
  'biz/statistics/report',
  'biz/notice/index',
  'biz/merchantComments',
  'biz/merchant/order'
]

// 过滤掉管理员不需要看到的商家专属菜单
function filterMerchantMenus(routes) {
  return routes.filter(route => {
    if (route.children) {
      route.children = filterMerchantMenus(route.children)
    }
    // 按组件路径过滤商家专属页面
    if (route.component && typeof route.component === 'string') {
      if (MERCHANT_ONLY_COMPONENTS.includes(route.component)) {
        return false
      }
    }
    // 按标题过滤"商户中心"（商家的主页，管理员有自己的"商户管理"）
    if (route.meta && route.meta.title === '商户中心') {
      return false
    }
    // 过滤后如果子菜单全没了，且自身不是页面，则去掉空目录
    if (route.children && route.children.length === 0 && !route.component) {
      return false
    }
    return true
  })
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
      if (route.name && route.children.some(child => child.name === route.name)) {
        delete route['name']
      }
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach(el => {
    el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path
    if (el.children && el.children.length && el.component === 'ParentView') {
      children = children.concat(filterChildren(el.children, el))
    } else {
      children.push(el)
    }
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

// 过滤constantRoutes中带有roles限制的路由
function filterConstantRoutesByRole(routes, parentRoles = null) {
  const filtered = []
  
  routes.forEach(route => {
    // 创建路由的副本
    const routeCopy = { ...route }
    
    // 如果路由有roles限制，检查当前用户是否有权限
    if (routeCopy.meta && routeCopy.meta.roles) {
      const requiredRoles = routeCopy.meta.roles
      const hasPermission = auth.hasRoleOr(requiredRoles)
      
      if (!hasPermission) {
        // 用户没有权限，跳过此路由
        return
      }
    }
    
    // 如果有子路由，递归过滤
    if (routeCopy.children && routeCopy.children.length > 0) {
      routeCopy.children = filterConstantRoutesByRole(routeCopy.children, routeCopy.meta?.roles)
      
      // 如果过滤后没有子路由，且父路由也没有component，则跳过父路由
      if (routeCopy.children.length === 0 && !routeCopy.component) {
        return
      }
    }
    
    filtered.push(routeCopy)
  })
  
  return filtered
}

export default usePermissionStore
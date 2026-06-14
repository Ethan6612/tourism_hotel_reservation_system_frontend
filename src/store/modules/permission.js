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
        // 🔒 保护逻辑：如果当前已经有过滤后的路由，检查新路由是否包含被过滤掉的菜单
        if (this.sidebarRouters && this.sidebarRouters.length > 0) {
          // 查找业务管理菜单
          const currentBizRoute = this.sidebarRouters.find(r => r.path === '/biz')
          const newBizRoute = routes.find(r => r.path === '/biz')
          
          if (currentBizRoute && newBizRoute && currentBizRoute.children && newBizRoute.children) {
            // 比较子菜单数量
            const currentCount = currentBizRoute.children.length
            const newCount = newBizRoute.children.length
            
            // 如果新路由的子菜单更多，说明可能是未过滤的全量路由，拒绝覆盖
            if (newCount > currentCount) {
              return // 拒绝更新
            }
          }
        }
        
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
            const sdata = JSON.parse(JSON.stringify(res.data))
            const rdata = JSON.parse(JSON.stringify(res.data))
            const defaultData = JSON.parse(JSON.stringify(res.data))
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
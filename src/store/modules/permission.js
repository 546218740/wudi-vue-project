import { asyncRoutes, constantRoutes } from '@/router'
import topMenus from '@/router/topMenus'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: [],
  topMenus: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  SET_TOPMENUS: (state, menu) => {
    state.topMenus = menu
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  generateTopMenus({ commit }, roles) {
    return new Promise(resolve => {
      let accessedTopMenus
      if (roles.includes('admin')) {
        accessedTopMenus = topMenus || []
      } else {
        accessedTopMenus = filterAsyncRoutes(topMenus, roles)
      }
      commit('SET_TOPMENUS', accessedTopMenus)
      resolve(accessedTopMenus)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

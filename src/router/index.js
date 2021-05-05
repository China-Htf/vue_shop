import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// import Users from '../components/user/users.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/users.vue')
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

// import List from '../components/goods/List.vue'
const List = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/List.vue')
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Add.vue')

// import Order from '../components/order/order.vue'
const Order = () => import(/* webpackChunkName: "Cate_Params" */ '../components/order/order.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Cate_Params" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  {path: '/', redirect: '/login'},
  {path: '/login', component: Login},
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    },{
      path: '/users',
      component: Users
    },{
      path: '/rights',
      component: Rights
    },{
      path: '/roles',
      component: Roles
    },{
      path: '/categories',
      component: Cate
    },{
      path:'/params',
      component: Params
    },{
      path:'/goods',
      component: List
    },{
      path:'/goods/add',
      component: Add
    },{
      path:'/orders',
      component: Order
    },{
      path:'/reports',
      component: Report
    }]
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

// 为路由对象，添加 beforeEach 导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //      next() 放行      next('/login')    强制跳转

  // 如果用户访问的是登录页 直接放行
  if(to.path === '/login') return next();
  // 从 sessionStorage 中获取保存的 token 值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token 强制跳转到登录页
  if(!tokenStr) return next('/login')
  next()
})

export default router

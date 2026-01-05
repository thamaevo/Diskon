import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Discounts from '../views/Discounts.vue'

const routes = [
  { path: '/', component: Discounts },
  { path: '/discounts', component: Discounts }
]

export default createRouter({
  history: createWebHistory(),
  routes
})

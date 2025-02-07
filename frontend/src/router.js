import { createRouter, createWebHistory } from 'vue-router';

import DashboardPage from './components/Dashboard.vue';
import BookCatalog from './components/BookCatalog.vue';
import BookCreate from './components/BookCreate.vue';
import MemberManagement from './components/MemberManagement.vue';
import MemberCreate from './components/MemberCreate.vue';
import LoanReturn from './components/LoanReturn.vue';
import UserLogin from './components/Login.vue';
import ForgotPassword from './components/ForgotPassword.vue';
import ResetPassword from '@/components/ResetPassword.vue';
import ReservationPage from './components/ReservationPage.vue';
import BookPlacementPage from './components/BookPlacementPage.vue';

const routes = [
  { path: '/', name: 'dashboard', component: DashboardPage },
  { path: '/login', name: 'login', component: UserLogin },
  { path: '/forgot-password', name: 'forgotPassword', component: ForgotPassword },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  { path: '/books', name: 'book-catalog', component: BookCatalog },
  { path: '/books-placement', name: 'book-placement', component: BookPlacementPage },
  { path: '/reservation', name: 'reservation', component: ReservationPage },
  {
    path: '/books/create',
    name: 'book-create',
    component: BookCreate,
    meta: { requiresAdmin: true }
  },
  {
    path: '/members',
    name: 'member-management',
    component: MemberManagement,
    meta: { requiresAdmin: true }
  },
  {
    path: '/members/create',
    name: 'member-create',
    component: MemberCreate,
    meta: { requiresAdmin: true }
  },
  {
    path: '/transactions',
    name: 'loan-return',
    component: LoanReturn,
    meta: { requiresAdmin: true }
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/forgot-password', '/reset-password'];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token');

  if (to.meta.requiresAdmin) {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.isAdmin) {
      return next({ name: 'dashboard' });
    }
  }
  if (authRequired && !token) {
    return next('/login');
  }
  next();
});

export default router;

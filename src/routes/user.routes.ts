import { Router } from 'express';
import {
  getAuthAdmin,
  loginAdmin,
  registerAdmin,
} from '../controllers/admin.controller';
import {
  getAuthUser,
  loginUser,
  register,
  createTracks,
} from '../controllers/user.controller';
import { AdminLoggedIn } from '../middlewares/admin.middleware';
import {
  isLoggedIn,
  validateLoginInputData,
  validateUserInputData,
} from '../middlewares/user.middleware';

export const USER_ROUTES = {
  USERS: '/user',
  USER_BY_ID: '/user/:id',
  USER: '/user',
  REGISTER: '/register',
  LOGIN: '/login',
  TRACKS: '/track',
  ADMIN_REGISTER: '/admin/register',
  ADMIN_LOGIN: '/admin/login',
  ADMIN: '/admin',
};

const userRoutes = Router();

userRoutes.post(USER_ROUTES.REGISTER, validateUserInputData, register);
userRoutes.post(USER_ROUTES.LOGIN, validateLoginInputData, loginUser);
userRoutes.get(USER_ROUTES.USER, isLoggedIn, getAuthUser);
userRoutes.get(USER_ROUTES.TRACKS, isLoggedIn, createTracks);
userRoutes.post(USER_ROUTES.ADMIN_REGISTER, registerAdmin);
userRoutes.post(USER_ROUTES.ADMIN_LOGIN, loginAdmin);
userRoutes.get(USER_ROUTES.ADMIN, AdminLoggedIn, getAuthAdmin);

export default userRoutes;

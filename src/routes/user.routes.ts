import { Router } from 'express';
import {
  getAuthUser,
  loginUser,
  register,
} from '../controllers/user.controller';
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
};

const userRoutes = Router();

userRoutes.post(USER_ROUTES.REGISTER, validateUserInputData, register);
userRoutes.post(USER_ROUTES.LOGIN, validateLoginInputData, loginUser);
userRoutes.get(USER_ROUTES.USER, isLoggedIn, getAuthUser);

export default userRoutes;

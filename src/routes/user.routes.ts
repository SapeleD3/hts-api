import { Router } from 'express';
import {
  deleteVideos,
  editVideos,
  getAuthAdmin,
  getVideo,
  getVideos,
  loginAdmin,
  registerAdmin,
  storeVideos,
} from '../controllers/admin.controller';
import {
  getAuthUser,
  loginUser,
  register,
  createTracks,
  getNetworkMembers,
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
  NETWORK: '/network',
  VIDEOS: '/videos',
  VIDEO: '/videos/:videoId',
  ADMIN_VIDEOS: '/admin/videos',
};

const userRoutes = Router();

userRoutes.post(USER_ROUTES.REGISTER, validateUserInputData, register);
userRoutes.post(USER_ROUTES.LOGIN, validateLoginInputData, loginUser);
userRoutes.get(USER_ROUTES.USER, isLoggedIn, getAuthUser);
userRoutes.get(USER_ROUTES.TRACKS, isLoggedIn, createTracks);
userRoutes.post(USER_ROUTES.ADMIN_REGISTER, registerAdmin);
userRoutes.post(USER_ROUTES.ADMIN_LOGIN, loginAdmin);
userRoutes.get(USER_ROUTES.ADMIN, AdminLoggedIn, getAuthAdmin);
userRoutes.post(USER_ROUTES.VIDEOS, AdminLoggedIn, storeVideos);
userRoutes.get(USER_ROUTES.NETWORK, isLoggedIn, getNetworkMembers);
userRoutes.get(USER_ROUTES.VIDEOS, isLoggedIn, getVideos);
userRoutes.delete(USER_ROUTES.VIDEO, AdminLoggedIn, deleteVideos);
userRoutes.put(USER_ROUTES.VIDEO, AdminLoggedIn, editVideos);
userRoutes.get(USER_ROUTES.ADMIN_VIDEOS, AdminLoggedIn, getVideos);
userRoutes.get(USER_ROUTES.VIDEO, AdminLoggedIn, getVideo);

export default userRoutes;

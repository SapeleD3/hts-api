import { Router } from 'express';
import {
  initializePaymentController,
  verifyPaymentController,
} from '../controllers/payment.controller';
import { isLoggedIn } from '../middlewares/user.middleware';

export const PAY_ROUTES = {
  PAY: '/pay',
  VERIFY: '/pay/verify',
};

const paymentRoutes = Router();

paymentRoutes.post(PAY_ROUTES.PAY, isLoggedIn, initializePaymentController);
paymentRoutes.post(PAY_ROUTES.VERIFY, isLoggedIn, verifyPaymentController);

export default paymentRoutes;

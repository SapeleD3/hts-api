import status, { ReasonPhrases } from 'http-status-codes';
import logger from '../helpers/logging';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.model';

const { UNAUTHORIZED, NOT_FOUND, BAD_GATEWAY } = status;
export async function AdminLoggedIn(req: any, res: any, next: any) {
  let token = req.headers.authorization;
  if (!token) {
    return res
      .status(UNAUTHORIZED)
      .json({ message: ReasonPhrases.UNAUTHORIZED });
  }

  if (token.includes('Bearer ')) {
    token = token.replace('Bearer ', '');
  }

  try {
    const { user: userId }: any = jwt.verify(
      token,
      String(process.env.JWT_SECRET_KEY),
      {
        issuer: process.env.ISSUER!,
      }
    );

    const currentUser: any = await Admin.findById(userId);

    if (!currentUser) {
      return res.status(NOT_FOUND).json({
        message: 'We could not find this user. Please contact support',
      });
    }

    req.user = currentUser;

    return next();
  } catch (error) {
    logger.error(error);
    return res.status(BAD_GATEWAY).json({
      message: 'Invalid token. Please log in and try again',
    });
  }
}

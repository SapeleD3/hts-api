import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { responseHandler } from '../index.constants';
import { sign } from 'jsonwebtoken';
import status, { ReasonPhrases } from 'http-status-codes';
import logger from '../helpers/logging';
import { Admin } from '../models/admin.model';
import { Video } from '../models/video.model';

const { INTERNAL_SERVER_ERROR, BAD_REQUEST, OK } = status;
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { password, userName } = req.body;
    logger.info(req.body);

    //check if username exists
    const existingUserName = await Admin.findOne({ userName });
    if (existingUserName) {
      responseHandler(res, BAD_REQUEST, {
        message: 'user name already exists',
        data: {},
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      password: hashedPassword,
      userName,
    });
    if (newAdmin) {
      const { _id } = newAdmin;
      const token = sign(
        { user: _id, isAdmin: true },
        process.env.JWT_SECRET_KEY!,
        {
          expiresIn: '24h',
          issuer: process.env.ISSUER!,
        }
      );
      return responseHandler(res, OK, {
        message: ReasonPhrases.OK,
        data: {
          token,
        },
      });
    }
    return responseHandler(res, BAD_REQUEST, {
      message: ReasonPhrases.BAD_REQUEST,
      data: {},
    });
  } catch (e) {
    logger.error(e);
    responseHandler(res, INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      data: {},
    });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;
    const user: any = await Admin.findOne({ userName });
    if (!user) {
      return responseHandler(res, BAD_REQUEST, {
        message: 'invalid credentials',
        data: {},
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return responseHandler(res, BAD_REQUEST, {
        message: 'invalid credentials',
        data: {},
      });
    }
    const token = sign(
      { user: user._id, isAdmin: true },
      process.env.JWT_SECRET_KEY!,
      {
        expiresIn: '24h',
        issuer: process.env.ISSUER!,
      }
    );
    return responseHandler(res, OK, {
      message: ReasonPhrases.OK,
      data: {
        token,
      },
    });
  } catch (e) {
    logger.error(e);
    responseHandler(res, INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      data: {},
    });
  }
};

export const getAuthAdmin = async (req: any, res: Response) => {
  try {
    const { _id } = req.user;
    const userData = await Admin.findOne({ _id }).select('-password');
    return responseHandler(res, OK, {
      message: ReasonPhrases.OK,
      data: {
        userData,
      },
    });
  } catch (e) {
    logger.error(e);
    responseHandler(res, INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      data: {},
    });
  }
};

export const storeVideos = async (req: any, res: Response) => {
  try {
    const vid = await Video.create(req.body);
    return responseHandler(res, OK, {
      message: ReasonPhrases.OK,
      data: {
        video: vid,
      },
    });
  } catch (e) {
    logger.error(e);
    responseHandler(res, INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      data: {},
    });
  }
};

export const getVideos = async (req: any, res: Response) => {
  try {
    const vid = await Video.find();
    return responseHandler(res, OK, {
      message: ReasonPhrases.OK,
      data: {
        video: vid,
      },
    });
  } catch (e) {
    logger.error(e);
    responseHandler(res, INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      data: {},
    });
  }
};

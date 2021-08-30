import { Request, Response } from 'express';
import status, { ReasonPhrases } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { responseHandler } from '../index.constants';
import { sign } from 'jsonwebtoken';
import { User } from '../models/user.model';
import logger from '../helpers/logging';

const { INTERNAL_SERVER_ERROR, BAD_REQUEST, OK } = status;
export const register = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, email, password, userName, fullName, referralLink } =
      req.body;
    logger.info(req.body);

    //check if username exists
    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      responseHandler(res, BAD_REQUEST, {
        message: 'user name already exists',
        data: {},
      });
    }

    //check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      responseHandler(res, BAD_REQUEST, {
        message: 'email already in use',
        data: {},
      });
    }

    //check if phonenumber exists
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      responseHandler(res, BAD_REQUEST, {
        message: 'phone number already registered to another user',
        data: {},
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    let newUser;

    //get referral details if it exists
    if (referralLink) {
      logger.info('LINK', referralLink);
      //get owner of referral link
      const linkOwner = await User.findOne({
        'networks.networkLink': referralLink,
      });
      const network = linkOwner?.networks?.filter((val) => val.networkLink);
      if (network) {
        newUser = await User.create({
          email,
          password: hashedPassword,
          fullName,
          phoneNumber,
          userName,
          referredBy: {
            user: linkOwner?._id,
            referredAt: new Date(),
            track: network[0].trackType,
            link: referralLink,
          },
          networks: [],
        });
      }
    } else {
      newUser = await User.create({
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        userName,
        networks: [],
      });
    }
    if (newUser) {
      const { _id } = newUser;
      const token = sign({ user: _id }, process.env.JWT_SECRET_KEY!, {
        expiresIn: '24h',
        issuer: process.env.ISSUER!,
      });
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

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;
    const user: any = await User.findOne({ userName });
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
    const token = sign({ user: user._id }, process.env.JWT_SECRET_KEY!, {
      expiresIn: '24h',
      issuer: process.env.ISSUER!,
    });
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

export const getAuthUser = async (req: any, res: Response) => {
  try {
    const { _id } = req.user;
    const userData = await User.findOne({ _id }).select('-password');
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

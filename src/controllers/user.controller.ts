import { Request, Response } from 'express';
import status, { ReasonPhrases } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { responseHandler } from '../index.constants';
import { sign } from 'jsonwebtoken';
import { iUserDocument, User } from '../models/user.model';
import logger from '../helpers/logging';
import { Track } from '../models/track.model';
import { Network } from '../models/network.model';

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
      const networkDetails: any = await Network.findOne({
        networkLink: referralLink,
      });
      //get owner of referral link
      const linkOwner: any = await User.findOne({
        $or: [
          { sNetworks: networkDetails._id },
          { pNetworks: networkDetails._id },
        ],
      });

      if (!linkOwner) {
        if (existingEmail) {
          responseHandler(res, BAD_REQUEST, {
            message: 'invalid referal link',
            data: {},
          });
        }
      }
      if (networkDetails) {
        newUser = await User.create({
          email,
          password: hashedPassword,
          fullName,
          phoneNumber,
          userName,
          referredBy: {
            user: linkOwner?._id,
            referredAt: new Date(),
            track: networkDetails.trackType,
            link: referralLink,
          },
        });
        await User.updateOne(
          { _id: linkOwner?._id },
          { $set: { membersCount: linkOwner?.membersCount + 1 } }
        );
        await Network.updateOne(
          { _id: networkDetails._id },
          {
            $push: {
              networkChildren: {
                userId: newUser._id,
                joinedAt: new Date(),
              },
            },
          }
        );
      }
    } else {
      newUser = await User.create({
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        userName,
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
    const userData = await User.findOne({ _id })
      .populate('sNetworks')
      .select('-password');
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

export const createTracks = async (req: any, res: Response) => {
  try {
    const { _id } = req.user;
    await Track.create([
      {
        trackName: 'standard',
        entryAmount: 10000,
        cycles: 1,
      },
      {
        trackName: 'medium',
        entryAmount: 50000,
        cycles: 1,
      },
      {
        trackName: 'premium',
        entryAmount: 100000,
        cycles: 1,
      },
    ]);
    const tracks = await Track.findOne({ _id });
    return responseHandler(res, OK, {
      message: ReasonPhrases.OK,
      data: {
        tracks,
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

type Child = {};

export const getNetworkMembers = async (req: any, res: Response) => {
  const { _id, sNetworks, userName } = req.user;
  try {
    const myStandardNetwork = await Network.findOne({
      $and: [{ networkOwner: _id }, { _id: sNetworks }],
    });
    const myFirstChildren: iUserDocument[] = await User.find({
      $and: [
        { 'referredBy.link': myStandardNetwork?.networkLink },
        { 'referredBy.user': _id },
      ],
    }).populate('sNetworks');
    const MyFirstChildrensChildren = await Promise.all(
      myFirstChildren.map(async (val: any) => {
        const { _id: fcId, sNetworks: myNetwork } = val;
        const myFirstChildren = await User.find({
          $and: [
            { 'referredBy.link': myNetwork?.networkLink },
            { 'referredBy.user': fcId },
          ],
        });
        const children = await Promise.all(
          myFirstChildren.map(async (val2: any) => {
            const { _id: fcId2, sNetworks: myNetwork2 } = val2;
            const myLastChildren = await User.find({
              $and: [
                { 'referredBy.link': myNetwork2?.networkLink },
                { 'referredBy.user': fcId2 },
              ],
            });
            return {
              ...val2._doc,
              name: val2._doc.userName,
              children: myLastChildren,
            };
          })
        );

        return {
          ...val._doc,
          name: val._doc.userName,
          children,
        };
      })
    );
    return responseHandler(res, OK, {
      message: ReasonPhrases.OK,
      data: {
        length: MyFirstChildrensChildren.length,
        Network: {
          name: userName,
          children: MyFirstChildrensChildren,
        },
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

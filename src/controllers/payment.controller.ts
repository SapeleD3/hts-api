import { Request, Response } from 'express';
import logger from '../helpers/logging';
import status, { ReasonPhrases } from 'http-status-codes';
import { responseHandler } from '../index.constants';
import paystack from '../helpers/paystack';
import { Transaction } from '../models/transaction.model';
import { User } from '../models/user.model';
import { Network } from '../models/network.model';
import { nanoid } from 'nanoid';
import { Track } from '../models/track.model';

const { InitializePayment, VerifyPayment } = paystack();
const { INTERNAL_SERVER_ERROR, BAD_REQUEST, OK } = status;

export const initializePaymentController = async (req: any, res: Response) => {
  try {
    const { _id } = req.user;
    let { amount, full_name, email } = req.body;
    let paystackAmount = amount * 100;
    let response = await InitializePayment({
      amount: paystackAmount,
      full_name,
      email,
    });
    let { status, message, data } = response;
    let payload = {
      user: _id,
      status,
      amountSent: amount,
      reference: data.reference,
    };
    if (status) {
      const { _id } = await Transaction.create(payload);
      return responseHandler(res, OK, {
        message: ReasonPhrases.OK,
        data: {
          reference: data.reference,
          transId: _id,
        },
      });
    } else {
      return responseHandler(res, BAD_REQUEST, {
        message,
        data: {},
      });
    }
  } catch (e) {
    logger.error(e);
    responseHandler(res, INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      data: {},
    });
  }
};

export const verifyPaymentController = async (req: any, res: Response) => {
  try {
    const { _id } = req.user;
    let { reference, transId } = req.body;
    let response = await VerifyPayment(reference);
    let { status, data } = response;
    if (status && data.status === 'success') {
      const actualAmount = data.amount / 100;
      await Transaction.updateOne(
        { _id: transId },
        {
          $set: { amountSent: actualAmount, status: data.status, reference },
        }
      );

      //activate plan
      const user: any = await User.findOne({ _id });
      const pTrack = await Track.findOne({ entryAmount: 100000 });
      const sTrack = await Track.findOne({ entryAmount: 10000 });

      if (user?.activatedUser) {
        if (user.activationLevel === 1 && actualAmount === 100000) {
          // creating a 100k network
          const network = await Network.create({
            networkID: nanoid(),
            networkLink: `${req.get('origin')}/network/2-${user.userName}`,
            networkOwner: _id,
            networkChildren: [],
            track: pTrack?._id,
          });
          const networks = [
            ...user.networks,
            {
              networkID: network._id,
              networkLink: network.networkLink,
              trackType: pTrack?._id,
            },
          ];
          await User.updateOne(
            { _id },
            {
              $set: { activationLevel: 2, lastActive: new Date(), networks },
            }
          );
        }
      } else {
        if (actualAmount === 10000) {
          // creating a 10k network
          const snetwork = await Network.create({
            networkID: nanoid(),
            networkLink: `${req.get('origin')}/network/1-${user?.userName}`,
            networkOwner: _id,
            networkChildren: [],
            track: sTrack?._id,
          });
          const networks = [
            ...user.networks,
            {
              networkID: snetwork._id,
              networkLink: snetwork.networkLink,
              trackType: sTrack?._id,
            },
          ];
          await User.updateOne(
            { _id },
            {
              $set: {
                activationLevel: 1,
                activatedUser: true,
                lastActive: new Date(),
                networks,
              },
            }
          );
        } else {
          // rejecting other network amounts
          return responseHandler(res, BAD_REQUEST, {
            message:
              'please register to the 10k package before you can access the higher packages',
            data: {},
          });
        }
      }

      //finish activating the plan
      return responseHandler(res, OK, {
        message: ReasonPhrases.OK,
        data: {
          reference: data.reference,
        },
      });
    } else {
      logger.info(data);
      return responseHandler(res, BAD_REQUEST, {
        message: data.gateway_response,
        data: {},
      });
    }
  } catch (e) {
    logger.error(e);
    responseHandler(res, INTERNAL_SERVER_ERROR, {
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      data: {},
    });
  }
};

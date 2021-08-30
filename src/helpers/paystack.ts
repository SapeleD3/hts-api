import axios from 'axios';
import logger from './logging';
import { config } from 'dotenv';
import { nanoid } from 'nanoid';
config();

const Paystack = () => {
  const PAYSTACK_SK_KEY = process.env.PAYSTACK_SK_KEY;
  const baseUrl = 'https://api.paystack.co';
  const headersRequest = {
    'Content-Type': 'application/json',
    'cache-control': 'no-cache',
    Authorization: `Bearer ${PAYSTACK_SK_KEY}`,
  };

  const InitializePayment = async (body: any) => {
    return await axios
      .post(
        `${baseUrl}/transaction/initialize`,
        { ...body, reference: `hts${nanoid()}` },
        { headers: { ...headersRequest } }
      )
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        logger.error(error);
        return error.response.data;
      });
  };

  const VerifyPayment = async (reference: string) => {
    return await axios
      .get(`${baseUrl}/transaction/verify/${reference}`, {
        headers: { ...headersRequest },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return error.response.data;
      });
  };

  return { InitializePayment, VerifyPayment };
};

export default Paystack;

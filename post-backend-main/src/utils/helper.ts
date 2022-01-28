import { Request } from 'express';
import jwt from 'jsonwebtoken';
import lodash from 'lodash';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { getRepository } from 'typeorm';
import User from 'entity/User';
import configConstants from 'utils/config';
import ejs from 'ejs';
import Notification from 'entity/Notification';

const stripe = new Stripe(configConstants.STRIPE_TEST_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

const transportCon = nodemailer.createTransport({
  pool: true,
  service: configConstants.SERVICE,
  host: configConstants.HOST,
  port: configConstants.PORT,
  secure: false,
  auth: {
    user: configConstants.USERNAME,
    pass: configConstants.PASSWORD,
  },
});

const sendEmail = async (
  email: string | undefined,
  sub: string,
  body: string,
  template: string,
  bodySecondary?: string
) => {
  if (email && sub && body) {
    await ejs
      .renderFile(`./src/views/${template}.ejs`, { body, bodySecondary })
      .then(async (result) => {
        const info = await transportCon.sendMail({
          from: `"${configConstants.SENDER_NAME}" ${configConstants.SENDER_EMAIL}`,
          to: email,
          subject: sub,
          html: result,
        });
        console.log('Email sent: %s', info.messageId);
      })
      .catch((error) => {
        console.log('Email not sent: ', error);
      });
  }
};

const signToken = (user: User): string => jwt.sign(
  {
    email: user.email,
    role: user.roles,
  },
  configConstants.SESSION_SECRET,
  {
    expiresIn: configConstants.JWT_EXPIRATION,
    subject: user.id ? (user.id).toString() : user.username,
  },
);

const refreshToken = (user: User): string => jwt.sign(
  {
    email: user.email,
    role: user.roles,
  },
  configConstants.SESSION_SECRET,
  {
    expiresIn: configConstants.REFRESH_JWT_EXPIRATION,
    subject: user.id ? (user.id).toString() : user.username,
  },
);

const isAuthenticated = (
  rawToken: string,
  req: Request,
) => {
  try {
    const splitData = rawToken ? rawToken.split('Bearer ') : undefined;
    const token = splitData !== undefined ? splitData[1] : '';
    if (!token) {
      return { status: 401 };
    }
    req.user = jwt.verify(token, configConstants.SESSION_SECRET) as Express.User;
    return req.user;
  } catch (error) {
    return { status: 401 };
  }
};

const responseData = (
  success: boolean,
  data: any, message: string,
  errors: any,
  operation: string,
) => {
  const newData = data || {};
  const respRaw = {
    success,
    data,
    message,
    errors,
    operation,
  };
  if (message) {
    respRaw.message = message;
  }
  if (success) {
    respRaw.data = newData;
  } else if (!success) {
    respRaw.errors = errors;
  }
  if (!errors) {
    delete respRaw.errors;
  }
  if (!data) {
    delete respRaw.data;
  }
  return respRaw;
};

const checkRoleType = (user: User) => {
  const data = {
    user: false,
  };
  const roles = user.roles.length > 0 ? user.roles : [];
  lodash.filter(
    roles, (o) => {
      if (o.name === configConstants.APP_USER) {
        data.user = true;
      }
    },
  );
  return data;
};

const AddressType = {
  HOME: 'HOME',
  OFFICE: 'OFFICE',
  OFFICE_LAT: 'OFFICE_LAT',
  OFFICE_LONG: 'OFFICE_LONG',
};

const BookingStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

const PaymentOptions = {
  STRIPE: 'STRIPE',
};

const Currency = {
  USD: 'USD',
  EURO: 'EURO',
  CAD: 'CAD',
  AUD: 'AUD',
};

const VehicleFileType = {
  VEHICLE_TLC_LICENCE: 'VEHICLE_TLC_LICENCE',
  DRIVER_LICENCE: 'DRIVER_LICENCE',
  VEHICLE_INSURANCE: 'VEHICLE_INSURANCE',
};

const FileType = {
  FRONT_VIEW: 'FRONT_VIEW',
  BACK_VIEW: 'BACK_VIEW',
};

const TrackStatus = {
  ACCEPTED: 'ACCEPTED',
  CANCEL: 'CANCEL',
  GO_FOR_PICKUP: 'GO_FOR_PICKUP',
  REACHED_AT_PICKUP: 'REACHED_AT_PICKUP',
  BOOKING_START: 'BOOKING_START',
  BOOKING_END: 'BOOKING_END',
};

const TxnType = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
};

const TxnStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

const RefType = {
  WALLET: 'WALLET',
  REQUEST: 'REQUEST',
  BOOKING: 'BOOKING',
};

const BooleanStatus = {
  ENABLE: 'ENABLE',
  DISABLE: 'DISABLE',
};

const OtpType = {
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  VERIFY_EMAIL: 'VERIFY_EMAIL',
};

const PPMStatus = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PENDING: 'PENDING',
};

const UserKey = {
  DEVICE_TOKEN: 'DEVICE_TOKEN',
};

const saveNotification = async (title: string, message: string, userId: number) => {
  if (title && message && userId) {
    const notificationRepository = getRepository(Notification);
    const notification = new Notification();
    notification.title = title;
    notification.message = message;
    notification.userId = userId;
    await notificationRepository.save(notification);
    return true;
  }
  return false;
};

const helper = {
  stripe,
  transportCon,
  sendEmail,
  signToken,
  refreshToken,
  isAuthenticated,
  responseData,
  checkRoleType,
  AddressType,
  BookingStatus,
  PaymentOptions,
  Currency,
  VehicleFileType,
  FileType,
  TrackStatus,
  TxnType,
  TxnStatus,
  RefType,
  BooleanStatus,
  OtpType,
  PPMStatus,
  UserKey,
  saveNotification,
};

export default helper;

export class BaseUser {

  public id: string;

  public name: string;

  public email: string;

  public password: string;

  public newPassword: string;

  public appType: string;

  public referralCode: string;

  public otp: string;

  public deviceToken: string;

  public resendOtp: boolean;

  public verifyEmail: boolean;

};

export class BaseUpload {

  public title: string;

  public images: Array<string>;

  public category: number;

  public subCategory: number;

  public description: string;

  public id?: number;

}


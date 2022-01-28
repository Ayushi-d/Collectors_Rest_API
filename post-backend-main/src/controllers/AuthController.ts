import {Body, Get, HeaderParam, JsonController, OnUndefined, Post, Put, Req, Res,} from 'routing-controllers';

import {OpenAPI} from 'routing-controllers-openapi';
import {getRepository, MoreThanOrEqual} from 'typeorm';
import {validate} from 'class-validator';
import jwt from 'jsonwebtoken';
import lodash from 'lodash';
import moment from 'moment';

import User from 'entity/User';
import Role from 'entity/Role';
import Wallet from 'entity/Wallet';
import Otp from 'entity/Otp';

import configConstants from 'utils/config';
import UserNotFoundError from 'errors/UserNotFoundError';
import helper, {BaseUser} from 'utils/helper';
import mainConstant from 'constant';

@JsonController('/auth')
export default class AuthController {

  @OpenAPI({
    description: 'User register up api for both roles',
  })
  @Post('/register')
  async registerApi(@Body({ required: true }) body: BaseUser) {
    if (
      body.email
        && body.name
        && body.password
        && body.appType
    ) {

      /* check user exist or not */
      const checkUserExist: any = await this.checkUserExistOrNot(body.email, mainConstant.user.EMAIL_KEY);
      if (checkUserExist.status === true) {
        return checkUserExist.data;
      }

      const userRepository = getRepository(User);
      const roleRepository = getRepository(Role);
      let roleType: string | any[] = [];
      if (body.appType === configConstants.APP_USER) {
        roleType = await roleRepository.find({ name: configConstants.APP_USER });
      }
      const rawReferralCode = await this.randomString(8);
      if (roleType.length > 0) {
        const user = new User();
        user.email = body.email;
        user.username = body.email;
        user.name = body.name;
        user.password = body.password;
        user.referralCode = rawReferralCode;
        user.roles = roleType;
        user.enabled = true;
        user.emailVerified = false;
        const errors = await validate(user);
        if (errors.length > 0) {
          return helper.responseData(
            false,
            '',
            '',
            errors,
            mainConstant.auth.USER_SIGNUP,
          );
        }
        user.refreshToken = await helper.refreshToken(user);
        const rawUser = await userRepository.save(user);
        if (rawUser) {
          user.referralCode = rawUser.id + user.referralCode;
          await userRepository.save(user);
        }
        await this.walletInitialize(user);

        const rawInfo:any = await this.generateOtpByUser(user, helper.OtpType.VERIFY_EMAIL);
        if (rawInfo.status) {
          return rawInfo.data;
        }
        const { code } = rawInfo.data;

        const newData: any = user;
        newData.token = await helper.signToken(user);

        const receiversEmail = user.email;
        const subj = mainConstant.auth.VERIFY_EMAIL_SUB;
        const link = await this.getUrl(code, body.appType);
        await helper.sendEmail(receiversEmail, subj, link, 'verificationTemplate');

        return helper.responseData(
          true,
          newData,
          mainConstant.auth.SIGNUP_SUCCESS_MESSAGE,
          '',
          mainConstant.auth.USER_SIGNUP,
        );

      }
      return helper.responseData(
        false,
        '',
        mainConstant.auth.APP_TYPE_NOT_FOUND,
        '',
        mainConstant.auth.USER_SIGNUP,
      );
    }
    const errors: { key: string; message: string; }[] = [];
    if (!body.name) {
      errors.push({
        key: 'name',
        message: 'Please enter full name. it is required attribute',
      });
    }
    if (!body.email) {
      errors.push({
        key: 'email',
        message: 'Please enter valid email id. it is required attribute',
      });
    }
    if (!body.password) {
      errors.push({
        key: 'password',
        message: 'Please enter password. it is required attribute',
      });
    }
    if (!body.appType) {
      errors.push({
        key: 'appType',
        message: 'Please send flag which type are you using. it is required attribute',
      });
    }
    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.auth.USER_SIGNUP,
    );
  }

  @OpenAPI({
    description: 'User login api for both roles',
  })
  @Post('/login')
  @OnUndefined(UserNotFoundError)
  async loginApi(@Body({ required: true }) body: BaseUser) {
    if (
      body.email
        && body.password
        && body.appType
    ) {
      const userRepository = getRepository(User);
      const { email, password, deviceToken } = body;
      const user = await userRepository.findOne({
        where: {
          email,
        },
        relations: ['paymentMethod'],
      });
      if (user) {
        const roles = user.roles.length > 0 ? user.roles : [];
        const picked = lodash.filter(roles, (o) => o.name === body.appType);
        if (picked.length === 0) {
          return helper.responseData(
            false,
            '',
            mainConstant.auth.CREDENTIALS_WRONG,
            '',
            mainConstant.auth.USER_LOGIN,
          );
        }
        if (!user.enabled) {
          return helper.responseData(
            false,
            '',
            mainConstant.auth.USER_DISABLED_BY_ADMIN,
            '',
            mainConstant.auth.USER_LOGIN,
          );
        }
        if (await User.comparePassword(user, password)) {
          user.refreshToken = await helper.refreshToken(user);
          const newData = await userRepository.save(user);
          newData.token = await helper.signToken(newData);

          return helper.responseData(
            true,
            newData,
            mainConstant.auth.LOGIN_SUCCESS_MESSAGE,
            '',
            mainConstant.auth.USER_LOGIN,
          );
        }
        return helper.responseData(
          false,
          '',
          mainConstant.auth.CREDENTIALS_WRONG,
          '',
          mainConstant.auth.USER_LOGIN,
        );
      }
      return helper.responseData(
        false,
        '',
        mainConstant.auth.USER_NOT_FOUND,
        '',
        mainConstant.auth.USER_LOGIN,
      );
    }
    const errors: { key: string; message: string; }[] = [];
    if (!body.email) {
      errors.push({
        key: 'email',
        message: 'Please enter valid email id. it is required attribute',
      });
    }
    if (!body.password) {
      errors.push({
        key: 'password',
        message: 'Please enter password. it is required attribute',
      });
    }
    if (!body.appType) {
      errors.push({
        key: 'appType',
        message: 'Please send flag which type are you using. it is required attribute',
      });
    }

    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.auth.USER_LOGIN,
    );
  }

  @OpenAPI({
    description: 'User login api for both roles',
  })
  @Post('/logout')
  async logOutApi(
  @HeaderParam('authorization') authToken: string,
    @Body({ required: true }) body: BaseUser,
    @Req() request: any,
    @Res() response: any,
  ) {
    if (body.appType) {
      const data:any = await helper.isAuthenticated(authToken, request);
      if (data !== undefined) {
        if (data.status === 401) {
          return response.sendStatus(401);
        }
        const email = data.email !== undefined ? data.email : '';
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({
          where: {
            email,
          },
        });
        if (user) {
          const roles = user.roles.length > 0 ? user.roles : [];
          const picked = lodash.filter(roles, (o) => o.name === body.appType);
          if (picked.length === 0) {
            return helper.responseData(
              false,
              '',
              mainConstant.auth.CREDENTIALS_WRONG,
              '',
              mainConstant.auth.USER_LOGOUT,
            );
          }

          return helper.responseData(
            true,
            '',
            mainConstant.auth.LOGOUT_SUCCESS_MESSAGE,
            '',
            mainConstant.auth.USER_LOGOUT,
          );
        }
        return helper.responseData(
          false,
          '',
          mainConstant.auth.USER_NOT_FOUND,
          '',
          mainConstant.auth.USER_LOGOUT,
        );
      }
    }
    const errors: { key: string; message: string; }[] = [];
    if (!body.appType) {
      errors.push({
        key: 'appType',
        message: 'Please send flag which type are you using. it is required attribute',
      });
    }
    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.auth.USER_LOGOUT,
    );
  }

  @Get('/refresh-token')
  @OpenAPI({
    description: 'refresh token',
  })
  async getRefreshToken(
  @HeaderParam('authorization') authToken: string,
    @Req() request: any,
    @Res() response: any,
  ) {
    const splitData = authToken ? authToken.split('Bearer ') : undefined;
    const token = splitData !== undefined ? splitData[1] : '';
    if (!token) {
      return response.sendStatus(401);
    }
    const data:any = await jwt.decode(token, { json: true });
    if (data !== undefined) {
      const email = data.email !== undefined ? data.email : '';
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({
        where: {
          email,
        },
      });
      if (!user) {
        return helper.responseData(
          false,
          '',
          mainConstant.auth.USER_NOT_FOUND,
          '',
          mainConstant.auth.REFRESH_TOKEN,
        );
      }
      const newData = user;
      try {
        await jwt.verify(token, configConstants.SESSION_SECRET);
        newData.token = await helper.signToken(user);
        return helper.responseData(
          true,
          newData,
          '',
          '',
          mainConstant.auth.REFRESH_TOKEN,
        );
      } catch (e) {
        return response.sendStatus(401);
      }
    }
    return helper.responseData(
      false,
      '',
      mainConstant.auth.USER_NOT_FOUND,
      '',
      mainConstant.auth.REFRESH_TOKEN,
    );
  }

  @Put('/forgot-password')
  @OpenAPI({
    description: 'forgot password',
  })
  async forgotPassword(@Body({ required: true }) body: BaseUser) {
    if (
      body.email
        && body.appType
    ) {
      const userRepository = getRepository(User);
      const { email } = body;
      const user = await userRepository.findOne({
        where: {
          email,
        },
      });
      if (!user) {
        return helper.responseData(
          false,
          '',
          mainConstant.auth.USER_NOT_FOUND,
          '',
          mainConstant.auth.FORGOT_PASSWORD,
        );
      }
      const roles = user.roles.length > 0 ? user.roles : [];
      const picked = lodash.filter(roles, (o) => o.name === body.appType);
      if (picked.length === 0) {
        return helper.responseData(
          false,
          '',
          mainConstant.auth.INVALID_REQUEST,
          '',
          mainConstant.auth.FORGOT_PASSWORD,
        );
      }

      let otpRec: any = '';
      if (!body.resendOtp) {
        otpRec = await this.otpCheckUser(user, helper.OtpType.FORGOT_PASSWORD);
      }

      if (otpRec.data !== undefined) {
        return helper.responseData(
          true,
          '',
          mainConstant.auth.ALREADY_REQUESTED,
          '',
          mainConstant.auth.FORGOT_PASSWORD,
        );
      }

      const rawInfo:any = await this.generateOtpByUser(user, helper.OtpType.FORGOT_PASSWORD);
      if (rawInfo.status) {
        return rawInfo.data;
      }
      const { code } = rawInfo.data;
      const receiversEmail = user.email;
      const subj = mainConstant.auth.RESET_PASSWORD_SUB;
      const emailBody = code;
      await helper.sendEmail(receiversEmail, subj, emailBody, 'otpTemplate');

      return helper.responseData(
        true,
        '',
        mainConstant.auth.OTP_SUCCESS_MESSAGE,
        '',
        mainConstant.auth.FORGOT_PASSWORD,
      );
    }
    const errors: { key: string; message: string; }[] = [];
    if (!body.email) {
      errors.push({
        key: 'email',
        message: 'Please enter valid email id. it is required attribute',
      });
    }
    if (!body.appType) {
      errors.push({
        key: 'appType',
        message: 'Please send flag which type are you using. it is required attribute',
      });
    }

    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.auth.FORGOT_PASSWORD,
    );
  }

  @Put('/verify-otp')
  @OpenAPI({
    description: 'verify otp for reset password',
  })
  async verifyOtp(@Body({ required: true }) body: BaseUser) {
    if (
      body.email
        && body.otp
        && body.appType
    ) {
      const userRepository = getRepository(User);
      const { email } = body;
      const user = await userRepository.findOne({
        where: {
          email,
        },
      });
      if (!user) {
        return helper.responseData(
          false,
          '',
          mainConstant.auth.USER_NOT_FOUND,
          '',
          mainConstant.auth.VERIFY_OTP,
        );
      }
      const roles = user.roles.length > 0 ? user.roles : [];
      const picked = lodash.filter(roles, (o) => o.name === body.appType);
      if (picked.length === 0) {
        return helper.responseData(
          false,
          '',
          mainConstant.auth.INVALID_REQUEST,
          '',
          mainConstant.auth.VERIFY_OTP,
        );
      }
      const actionType = helper.OtpType.FORGOT_PASSWORD;
      const otpRec:any = await this.otpCheckUser(user, actionType);
      if (otpRec.data === undefined) {
        return helper.responseData(
          false,
          '',
          mainConstant.auth.NOT_REQUESTED_OTP,
          '',
          mainConstant.auth.VERIFY_OTP,
        );
      }
      const codeExpire = await this.otpExpireOrNot(otpRec.data);
      if (codeExpire) {
        await this.expireOldOtpByUser(user, actionType);
        return helper.responseData(
          false,
          '',
          mainConstant.auth.OTP_EXPIRE,
          '',
          mainConstant.auth.VERIFY_OTP,
        );
      }
      if (otpRec.data.code === body.otp) {
        if (body.newPassword) {
          user.password = await User.hashPassword(body.newPassword);
          await userRepository.save(user);
          await this.expireOldOtpByUser(user, actionType);
          return helper.responseData(
            true,
            '',
            mainConstant.auth.PASSWORD_UPDATE_SUCCESS_MESSAGE,
            '',
            mainConstant.auth.VERIFY_OTP,
          );
        }
        return helper.responseData(
          true,
          '',
          mainConstant.auth.OTP_MATCHED,
          '',
          mainConstant.auth.VERIFY_OTP,
        );

      }
      return helper.responseData(
        false,
        '',
        mainConstant.auth.OTP_WRONG,
        '',
        mainConstant.auth.VERIFY_OTP,
      );
    }
    const errors: { key: string; message: string; }[] = [];
    if (!body.email) {
      errors.push({
        key: 'email',
        message: 'Please enter valid email id. it is required attribute',
      });
    }
    if (!body.otp) {
      errors.push({
        key: 'otp',
        message: 'Please enter otp for verify your request. it is required attribute',
      });
    }
    if (!body.appType) {
      errors.push({
        key: 'appType',
        message: 'Please send flag which type are you using. it is required attribute',
      });
    }

    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.auth.VERIFY_OTP,
    );
  }

  @Put('/verify-email')
  @OpenAPI({
    description: 'verify otp for email verification',
  })
  async verifyEmail(@Body({ required: true }) body: BaseUser) {
    if (
      body.email
        && body.appType
    ) {
      const userRepository = getRepository(User);
      const { email } = body;
      const user = await userRepository.findOne({
        where: {
          email,
        },
      });
      if (!user) {
        return helper.responseData(
          false,
          '',
          mainConstant.auth.USER_NOT_FOUND,
          '',
          mainConstant.auth.VERIFY_EMAIL,
        );
      }
      const roles = user.roles.length > 0 ? user.roles : [];
      const picked = lodash.filter(roles, (o) => o.name === body.appType);
      if (picked.length === 0) {
        return helper.responseData(
          false,
          '',
          mainConstant.auth.INVALID_REQUEST,
          '',
          mainConstant.auth.VERIFY_EMAIL,
        );
      }
      const actionType = helper.OtpType.VERIFY_EMAIL;
      if (body.resendOtp) {
        const rawInfo: any = await this.generateOtpByUser(user, actionType);
        if (rawInfo.status) {
          return rawInfo.data;
        }
        const { code } = rawInfo.data;
        if (code !== undefined) {
          const receiversEmail = user.email;
          const subj = mainConstant.auth.VERIFY_EMAIL_SUB;
          const link = await this.getUrl(code, body.appType);
          await helper.sendEmail(receiversEmail, subj, link, 'otpTemplate');
          return helper.responseData(
            true,
            '',
            mainConstant.auth.OTP_SUCCESS_MESSAGE,
            '',
            mainConstant.auth.VERIFY_EMAIL,
          );
        }
      }
      if (!body.otp && !body.resendOtp) {
        const errors: { key: string; message: string; }[] = [];

        errors.push({
          key: 'otp',
          message: 'Please enter otp for verify your request. it is required attribute',
        });

        return helper.responseData(
          false,
          '',
          mainConstant.auth.NO_INPUT_FOUND,
          errors,
          mainConstant.auth.VERIFY_EMAIL,
        );
      }
      const otpRec:any = await this.otpCheckUser(user, actionType);
      if (otpRec.data === undefined) {
        return helper.responseData(
          false,
          '',
          mainConstant.auth.NOT_REQUESTED_OTP_FOR_EMAIL,
          '',
          mainConstant.auth.VERIFY_EMAIL,
        );
      }
      const codeExpire = await this.otpExpireOrNot(otpRec.data);
      if (codeExpire) {
        await this.expireOldOtpByUser(user, actionType);
        return helper.responseData(
          false,
          '',
          mainConstant.auth.OTP_EXPIRE,
          '',
          mainConstant.auth.VERIFY_EMAIL,
        );
      }
      if (otpRec.data.code === body.otp) {
        if (body.verifyEmail) {
          user.emailVerified = true;
          await userRepository.save(user);
          await this.expireOldOtpByUser(user, actionType);
          return helper.responseData(
            true,
            '',
            mainConstant.auth.EMAIL_VERIFY_SUCCESS_MESSAGE,
            '',
            mainConstant.auth.VERIFY_EMAIL,
          );
        }
        return helper.responseData(
          true,
          '',
          mainConstant.auth.OTP_MATCHED,
          '',
          mainConstant.auth.VERIFY_EMAIL,
        );

      }
      return helper.responseData(
        false,
        '',
        mainConstant.auth.OTP_WRONG,
        '',
        mainConstant.auth.VERIFY_EMAIL,
      );
    }
    const errors: { key: string; message: string; }[] = [];
    if (!body.email) {
      errors.push({
        key: 'email',
        message: 'Please enter valid email id. it is required attribute',
      });
    }
    if (!body.appType) {
      errors.push({
        key: 'appType',
        message: 'Please send flag which type are you using. it is required attribute',
      });
    }

    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.auth.VERIFY_EMAIL,
    );
  }

  public async walletInitialize(user: User) {
    const walletRepository = getRepository(Wallet);
    if (user) {
      const wallet = new Wallet();
      wallet.walletBalance = 0;
      wallet.lockedBalance = 0;
      wallet.user = user;
      await walletRepository.save(wallet);
    }
  }

  public async randomString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public async checkUserExistOrNot(
    val: string,
    type: string = mainConstant.user.USERNAME_KEY,
    message: string = mainConstant.auth.USER_ALREADY_EXIST,
    screen: string = mainConstant.auth.USER_SIGNUP,
  ) {
    let findUser: any = '';
    const userRepository = getRepository(User);
    if (type === mainConstant.user.EMAIL_KEY) {
      findUser = await userRepository.findOne({ email: val });
    } else if (type === mainConstant.user.USERNAME_KEY) {
      findUser = await userRepository.findOne({ username: val });
    }
    if (findUser) {
      return {
        data: helper.responseData(
          false,
          '',
          message,
          '',
          screen,
        ),
        status: true,
      };
    }
    return {
      data: '',
      status: false,
    };
  }

  public async expireOldOtpByUser(user:User, type: string) {
    const otpRepository = getRepository(Otp);
    const otpRec = await otpRepository.findOne({
      user,
      enabled: true,
      type,
    });
    if (otpRec) {
      otpRec.enabled = false;
      await otpRepository.save(otpRec);
    }
    return true;
  }

  public async generateOtpByUser(user:User, type: string) {
    const data = await this.otpLimitCheck(user, type);
    if (data.status) {
      return data;
    }
    await this.expireOldOtpByUser(user, type);
    const otpRepository = getRepository(Otp);
    const uniqueCode = await this.randomString(6);
    const otp = new Otp();
    otp.user = user;
    otp.enabled = true;
    otp.type = type;
    otp.code = user.id + uniqueCode;
    await otpRepository.save(otp);
    return {
      data: {
        code: otp.code,
      },
      status: false,
    };
  }

  public async otpCheckUser(user:User, type: string) {
    const otpRepository = getRepository(Otp);
    const rec = await otpRepository.findOne({
      user,
      enabled: true,
      type,
    });
    return { data: rec };
  }

  public async otpExpireOrNot(rec:Otp) {
    if (rec) {
      const currentTime = moment();
      const expireAt = moment(rec.createdAt).add(configConstants.OTP_EXPIRATION, 'minutes');
      const diffInMinutes = expireAt.diff(currentTime, 'minutes');
      return diffInMinutes < 0;
    }
    return false;
  }

  public async otpLimitCheck(user:User, type: string) {
    const otpRepository = getRepository(Otp);
    const checkDate = moment().utc(true).format('YYYY-MM-DD');
    const rows = await otpRepository.find({
      where: {
        user,
        type,
        createdAt: MoreThanOrEqual(checkDate),
      },
    });
    if (rows.length >= configConstants.ONE_DAY_OTP_LIMIT) {
      return {
        data: helper.responseData(
          false,
          '',
          mainConstant.auth.OTP_LIMIT_REACHED,
          '',
          mainConstant.auth.FORGOT_PASSWORD,
        ),
        status: true,
      };
    }
    return {
      data: '',
      status: false,
    };
  }

  public async getUrl(code: string, appType: string) {
    return code;
  }

}

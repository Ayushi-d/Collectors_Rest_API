import {
  Body,
  Get,
  HeaderParam,
  JsonController,
  Put,
  Req,
  Res,
  Post,
  Delete, Param,
} from 'routing-controllers';
import { Not } from 'typeorm';

import { OpenAPI } from 'routing-controllers-openapi';
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';

import User from 'entity/User';

import helper, { BaseUpload } from 'utils/helper';
import configConstants from 'utils/config';
import mainConstant from 'constant';
import { UpdateUser } from 'constant/user';
import AuthController from './AuthController';
import Uploads from 'entity/Uploads';
import Category from "entity/Category";
import SubCategory from "entity/SubCategory";

@JsonController('/user')
export default class UserController extends AuthController {
  @OpenAPI({
    description: 'User sign up api for both roles',
  })
  @Put('/update-profile')
  async updateProfile(
    @HeaderParam('authorization') authToken: string,
    @Body({ required: true }) body: UpdateUser,
    @Req() request: any,
    @Res() response: any
  ) {
    if (
      (body.username ||
        body.name ||
        body.email ||
        body.city ||
        body.zipCode ||
        body.address ||
        body.country ||
        body.phoneNumber ||
        body.paypalEmail ||
        body.notificationEnable ||
        body.latitude ||
        body.userBio ||
        body.longitude) &&
      body.appType
    ) {
      let flagStatus = false;
      if (body.notificationEnable === helper.BooleanStatus.ENABLE) {
        flagStatus = true;
      }
      const data: any = await helper.isAuthenticated(authToken, request);
      if (data !== undefined) {
        if (data.status === 401) {
          return response.sendStatus(401);
        }
        const email = data.email !== undefined ? data.email : '';
        if (email) {
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
              mainConstant.user.USER_NOT_FOUND,
              '',
              mainConstant.user.PROFILE_UPDATE
            );
          }
          if (body.username) {
            /* check username exist or not */
            const checkUserExist: any = await this.checkUserExistOrNot(
              body.username,
              mainConstant.user.USERNAME_KEY,
              mainConstant.user.USER_ALREADY_EXIST,
              mainConstant.user.PROFILE_UPDATE
            );
            if (checkUserExist.status === true) {
              return checkUserExist.data;
            }
            user.username = body.username;
          }
          if (body.email) {
            /* check username exist or not */
            const checkUserExist: any = await this.checkUserExistOrNot(
              body.email,
              mainConstant.user.EMAIL_KEY,
              mainConstant.user.USER_ALREADY_EXIST,
              mainConstant.user.PROFILE_UPDATE
            );
            if (checkUserExist.status === true) {
              return checkUserExist.data;
            }
            user.email = body.email;
          }
          if (body.name) {
            user.name = body.name;
          }
          if (body.city) {
            user.city = body.city;
          }
          if (body.zipCode) {
            user.zipCode = body.zipCode;
          }
          if (body.address) {
            user.address = body.address;
          }
          if (body.country) {
            user.country = body.country;
          }
          if (body.phoneNumber) {
            user.phoneNumber = body.phoneNumber;
          }
          if (body.paypalEmail) {
            user.paypalEmail = body.paypalEmail;
          }
          if (body.notificationEnable) {
            user.notificationEnable = flagStatus;
          }
          if (body.latitude && body.longitude) {
            user.latitude = body.latitude;
            user.longitude = body.longitude;
          }
          if (body.userBio) {
            user.userBio = body.userBio;
          }
          const errors = await validate(user);

          if (errors.length > 0) {
            return helper.responseData(
              false,
              '',
              '',
              errors,
              mainConstant.user.PROFILE_UPDATE
            );
          }

          await userRepository.save(user);

          if (body.resendOtp && body.email) {
            const rawInfo: any = await this.generateOtpByUser(
              user,
              helper.OtpType.VERIFY_EMAIL
            );
            if (rawInfo.status) {
              return rawInfo.data;
            }
            const { code } = rawInfo.data;

            const receiversEmail = user.email;
            const subj = mainConstant.auth.VERIFY_EMAIL_SUB;
            const link = await this.getUrl(code, body.appType);
            await helper.sendEmail(
              receiversEmail,
              subj,
              link,
              'verificationTemplate'
            );
          }
          const updatedUser: any = await userRepository.findOne({
            where: {
              id: user.id,
            },
            relations: ['paymentMethod'],
          });

          updatedUser.token = await helper.signToken(updatedUser);

          return helper.responseData(
            true,
            updatedUser,
            mainConstant.user.PROFILE_UPDATE_SUCCESS_MESSAGE,
            '',
            mainConstant.user.PROFILE_UPDATE
          );
        }
        return helper.responseData(
          false,
          '',
          mainConstant.user.USER_NOT_FOUND,
          '',
          mainConstant.user.PROFILE_UPDATE
        );
      }
      return helper.responseData(
        false,
        '',
        mainConstant.user.USER_NOT_FOUND,
        '',
        mainConstant.user.PROFILE_UPDATE
      );
    }
    return helper.responseData(
      false,
      '',
      mainConstant.user.NO_INPUT_FOUND,
      '',
      mainConstant.user.PROFILE_UPDATE
    );
  }

  @OpenAPI({
    description: 'User change password for both roles',
  })
  @Put('/change-password')
  async changePassword(
    @HeaderParam('authorization') authToken: string,
    @Body({ required: true }) body: UpdateUser,
    @Req() request: any,
    @Res() response: any
  ) {
    if (body.currentPassword && body.newPassword) {
      const data: any = await helper.isAuthenticated(authToken, request);
      if (data !== undefined) {
        if (data.status === 401) {
          return response.sendStatus(401);
        }
        const email = data.email !== undefined ? data.email : '';
        if (email) {
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
              mainConstant.user.USER_NOT_FOUND,
              '',
              mainConstant.user.CHANGE_PASSWORD
            );
          }
          if (await User.comparePassword(user, body.currentPassword)) {
            user.password = await User.hashPassword(body.newPassword);
            await userRepository.save(user);
            const newData = user;
            newData.token = await helper.signToken(user);

            return helper.responseData(
              true,
              newData,
              mainConstant.user.PASSWORD_UPDATE_SUCCESS_MESSAGE,
              '',
              mainConstant.user.CHANGE_PASSWORD
            );
          }
          return helper.responseData(
            false,
            '',
            mainConstant.user.CREDENTIALS_WRONG,
            '',
            mainConstant.user.CHANGE_PASSWORD
          );
        }
      }
      return helper.responseData(
        false,
        '',
        mainConstant.user.USER_NOT_FOUND,
        '',
        mainConstant.user.CHANGE_PASSWORD
      );
    }
    return helper.responseData(
      false,
      '',
      mainConstant.user.NO_VALID_INPUT_FOUND,
      '',
      mainConstant.user.CHANGE_PASSWORD
    );
  }

  @Get('/my-profile')
  @OpenAPI({
    description: 'Get logged in user profile',
  })
  async getMyProfile(
    @HeaderParam('authorization') authToken: string,
    @Req() request: any,
    @Res() response: any
  ) {
    const data: any = await helper.isAuthenticated(authToken, request);
    if (data !== undefined) {
      if (data.status === 401) {
        return response.sendStatus(401);
      }
      const email = data.email !== undefined ? data.email : '';
      const userRepository = getRepository(User);
      let user;
      if (data.role[0].name === configConstants.SUPER_ADMIN) {
        user = await userRepository.find({
          relations: ['uploads'],
          where: { email: Not(configConstants.ADMIN_EMAIL) },
          order: {
            createdAt : 'ASC',
          }
        });
      } else if (data.role[0].name === configConstants.APP_USER) {
        user = await userRepository.findOne({
          where: {
            email,
          },
          relations: ['uploads'],
        });
      }
      if (!user) {
        return helper.responseData(
          false,
          '',
          mainConstant.user.USER_NOT_FOUND,
          '',
          mainConstant.user.MY_PROFILE
        );
      }

      return helper.responseData(
        true,
        user,
        '',
        '',
        mainConstant.user.MY_PROFILE
      );
    }
    return helper.responseData(
      false,
      '',
      mainConstant.user.USER_NOT_FOUND,
      '',
      mainConstant.user.MY_PROFILE
    );
  }

  @OpenAPI({
    description: 'Upload user posts',
  })
  @Post('/upload-post')
  async UploadPost(
    @HeaderParam('authorization') authToken: string,
    @Req() request: any,
    @Res() response: any,
    @Body({ required: true }) body: BaseUpload
  ) {
    if (body.title && body.images && body.category && body.subCategory) {
      const data: any = await helper.isAuthenticated(authToken, request);
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
        if (!user) {
          return helper.responseData(
            false,
            '',
            mainConstant.user.USER_NOT_FOUND,
            '',
            mainConstant.user.UPLOAD_POST
          );
        }
        const categoryRepository = getRepository(Category);
        const subCategoryRepository = getRepository(SubCategory);
        const category = await categoryRepository.findOne({
          where: {
            id: body.category,
          },
        });
        if(!category){
          return helper.responseData(
              false,
              '',
              mainConstant.user.CATEGORY_NOT_FOUND,
              '',
              mainConstant.user.UPLOAD_POST
          );
        }
        const subCategory = await subCategoryRepository.findOne({
          where: {
            id: body.subCategory,
          },
        });
        if(!subCategory){
          return helper.responseData(
              false,
              '',
              mainConstant.user.SUB_CATEGORY_NOT_FOUND,
              '',
              mainConstant.user.UPLOAD_POST
          );
        }

        const uploadRespository = getRepository(Uploads);
        const upload = new Uploads();
        upload.title = body.title;

        upload.categoryId = category.id;
        upload.subCategoryId = subCategory.id;
        if(body.description) {
          upload.description = body.description;
        }
        upload.images = body.images;
        upload.userId = user.id;
        const errors = await validate(upload);
        if (errors.length > 0) {
          return helper.responseData(
            false,
            '',
            '',
            errors,
            mainConstant.user.UPLOAD_POST
          );
        }
        try {
          const data = await uploadRespository.save(upload);
          return helper.responseData(
            true,
            data,
            mainConstant.user.UPLOAD_SUCCESS,
            '',
            mainConstant.user.UPLOAD_POST
          );
        } catch (error) {
          return helper.responseData(
            false,
            '',
            mainConstant.user.UPLOAD_FAILED,
            error,
            mainConstant.user.UPLOAD_POST
          );
        }
      }
      return helper.responseData(
        false,
        '',
        mainConstant.user.USER_NOT_FOUND,
        '',
        mainConstant.user.UPLOAD_POST
      );
    }
    const errors: { key: string; message: string }[] = [];
    if (!body.title) {
      errors.push({
        key: 'title',
        message: 'Please enter title for post.',
      });
    }
    if (!body.images) {
      errors.push({
        key: 'images',
        message: 'Please upload atleast one image.',
      });
    }
    if (!body.category) {
      errors.push({
        key: 'category',
        message: 'Please select category id.',
      });
    }
    if (!body.subCategory) {
      errors.push({
        key: 'subCategory',
        message: 'Please select sub-category id.',
      });
    }
    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.user.UPLOAD_POST
    );
  }


  @OpenAPI({
    description: 'Edit user posts',
  })
  @Post('/edit-post')
  async EditPost(
      @HeaderParam('authorization') authToken: string,
      @Req() request: any,
      @Res() response: any,
      @Body({ required: true }) body: BaseUpload
  ) {
    if (body.title && body.images) {
      const data: any = await helper.isAuthenticated(authToken, request);
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
        if (!user) {
          return helper.responseData(
              false,
              '',
              mainConstant.user.USER_NOT_FOUND,
              '',
              mainConstant.user.UPLOAD_POST
          );
        }
        const uploadRespository = getRepository(Uploads);
        const upload: any = await uploadRespository.findOne({
          where: { id: body.id },
        });
        if (!upload) {
          return helper.responseData(
              false,
              '',
              mainConstant.user.POST_NOT_FOUND,
              '',
              mainConstant.user.UPLOAD_POST
          );
        }
        if (body.title) {
          upload.title = body.title;
        }
        if (body.description) {
          upload.description = body.description;
        }
        if (body.category) {
          const categoryRepository = getRepository(Category);
          const category = await categoryRepository.findOne({
            where: {
              id: body.category,
            },
          });
          if(!category){
            return helper.responseData(
                false,
                '',
                mainConstant.user.CATEGORY_NOT_FOUND,
                '',
                mainConstant.user.UPLOAD_POST
            );
          }
          upload.category = category.id;
        }
        if (body.subCategory) {
          const subCategoryRepository = getRepository(SubCategory);
          const subCategory = await subCategoryRepository.findOne({
            where: {
              id: body.subCategory,
            },
          });
          if(!subCategory){
            return helper.responseData(
                false,
                '',
                mainConstant.user.SUB_CATEGORY_NOT_FOUND,
                '',
                mainConstant.user.UPLOAD_POST
            );
          }

          upload.subCategory = subCategory.id;
        }
        if (body.images) {
          upload.images = body.images;
        }

        const errors = await validate(upload);
        if (errors.length > 0) {
          return helper.responseData(
              false,
              '',
              '',
              errors,
              mainConstant.user.UPLOAD_POST
          );
        }
        try {
          const data = await uploadRespository.save(upload);
          return helper.responseData(
              true,
              data,
              mainConstant.user.UPLOAD_SUCCESS,
              '',
              mainConstant.user.UPLOAD_POST
          );
        } catch (error) {
          return helper.responseData(
              false,
              '',
              mainConstant.user.UPLOAD_FAILED,
              error,
              mainConstant.user.UPLOAD_POST
          );
        }
      }
      return helper.responseData(
          false,
          '',
          mainConstant.user.USER_NOT_FOUND,
          '',
          mainConstant.user.UPLOAD_POST
      );
    }
    const errors: { key: string; message: string }[] = [];
    if (!body.id) {
      errors.push({
        key: 'id',
        message: 'Please send id for update post.',
      });
    }
    return helper.responseData(
        false,
        '',
        mainConstant.auth.NO_INPUT_FOUND,
        errors,
        mainConstant.user.UPLOAD_POST
    );
  }

  @OpenAPI({
    description: 'Delete post',
  })
  @Delete('/delete-post')
  async DeletePost(
    @HeaderParam('authorization') authToken: string,
    @Req() request: any,
    @Res() response: any,
    @Body({ required: true }) body: BaseUpload
  ) {
    if (body.id) {
      const data: any = await helper.isAuthenticated(authToken, request);
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
        if (!user) {
          return helper.responseData(
            false,
            '',
            mainConstant.user.USER_NOT_FOUND,
            '',
            mainConstant.user.UPLOAD_POST
          );
        }
        const uploadsRepository = getRepository(Uploads);
        if (user.roles[0].name === configConstants.SUPER_ADMIN) {
          try {
            await uploadsRepository.delete(body.id);
            return helper.responseData(
              true,
              '',
              'Post deleted',
              '',
              mainConstant.user.DELETE_POST
            );
          } catch (error) {
            return helper.responseData(
              false,
              '',
              'Unable to delete post',
              error,
              mainConstant.user.DELETE_POST
            );
          }
        } else {
          try {
            const checkUpload = await uploadsRepository.findOne({
              where: {
                id: body.id
              }
            });
            if (checkUpload && checkUpload.userId === user.id) {
              await uploadsRepository.delete(body.id);
              return helper.responseData(
                  true,
                  '',
                  'Post deleted',
                  '',
                  mainConstant.user.DELETE_POST
              );
            }
            return helper.responseData(
                false,
                '',
                'Unable to delete post',
                '',
                mainConstant.user.DELETE_POST
            );
          } catch (error) {
            return helper.responseData(
              false,
              '',
              'Unable to delete post',
              error,
              mainConstant.user.DELETE_POST
            );
          }
        }
      }
      return helper.responseData(
        false,
        '',
        mainConstant.user.USER_NOT_FOUND,
        '',
        mainConstant.user.DELETE_POST
      );
    }
    const errors: { key: string; message: string }[] = [];
    if (!body.id) {
      errors.push({
        key: 'upload',
        message: 'Please select atleast one post.',
      });
    }
    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.user.UPLOAD_POST
    );
  }

  @Get('/posts')
  @OpenAPI({
    description: 'Get all posts',
  })
  async getPosts(
    @Req() _request: any,
    @Res() _response: any
  ) {
      const posts = await getRepository(Uploads)
        .createQueryBuilder('uploads')
        .select([
          'uploads',
          'user.id',
          'user.email',
          'user.address',
          'user.city',
          'user.emailVerified',
          'user.profileImage',
          'user.enabled',
          'user.createdAt',
          'user.updatedAt',
        ])
        .innerJoinAndSelect('uploads.user', 'user')
        .orderBy('uploads.updatedAt', 'DESC')
        .getMany();
      if (!posts) {
        return helper.responseData(
          false,
          '',
          mainConstant.user.USER_NOT_FOUND,
          '',
          mainConstant.user.MY_PROFILE
        );
      }

      return helper.responseData(
        true,
        posts,
        '',
        '',
        mainConstant.user.MY_PROFILE
      );
      }

  @OpenAPI({
    description: 'User can set enable or disable user',
  })
  @Put('/enable-user')
  async enableUser(
      @HeaderParam('authorization') authToken: string,
      @Body({ required: true }) body: {
        id: number,
        status: string,
      },
      @Req() request: any,
      @Res() response: any,
  ) {
    if (
        body.id
        && body.status
    ) {
      let flagStatus = false;
      if (body.status === helper.BooleanStatus.ENABLE) {
        flagStatus = true;
      }
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
        if (!user) {
          return helper.responseData(
              false,
              '',
              mainConstant.user.USER_NOT_FOUND,
              '',
              mainConstant.user.USER_ENABLE_DISABLE_BY_ADMIN
          );
        }
        if (user.roles[0].name === configConstants.SUPER_ADMIN) {
          return helper.responseData(
              false,
              '',
              mainConstant.user.USER_NOT_HAVE_ADMIN_PERMISSION,
              '',
              mainConstant.user.USER_ENABLE_DISABLE_BY_ADMIN,
          );
        }
        if (body.id) {
          const userRepository = getRepository(User);
          const user = await userRepository.findOne({
            where: {
              id: body.id,
            },
          });
          if (!user) {
            return helper.responseData(
                false,
                '',
                mainConstant.user.USER_NOT_FOUND,
                '',
                mainConstant.user.USER_ENABLE_DISABLE_BY_ADMIN,
            );
          }

          if (user.enabled === flagStatus) {
            let errorMessage = mainConstant.user.USER_ALREADY_ENABLE;
            if (!flagStatus) {
              errorMessage = mainConstant.user.USER_ALREADY_DISABLE;
            }
            return helper.responseData(
                false,
                '',
                errorMessage,
                '',
                mainConstant.user.USER_ENABLE_DISABLE_BY_ADMIN,
            );
          }

          let successMessage = mainConstant.user.USER_ENABLE_SUCCESS_MESSAGE;
          if (!flagStatus) {
            user.enabled = false;
            successMessage = mainConstant.user.USER_DISABLE_SUCCESS_MESSAGE;
          } else {
            user.enabled = true;
          }
          await userRepository.save(user);

          return helper.responseData(
              true,
              user,
              successMessage,
              '',
              mainConstant.user.USER_ENABLE_DISABLE_BY_ADMIN,
          );
        }
      }
      return helper.responseData(
          false,
          '',
          mainConstant.user.USER_NOT_FOUND,
          '',
          mainConstant.user.USER_ENABLE_DISABLE_BY_ADMIN,
      );
    }
    const errors: { key: string; message: string; }[] = [];
    if (!body.id) {
      errors.push({
        key: 'id',
        message: 'Please send user id for perform this request. it is required attribute',
      });
    }
    if (!body.status) {
      errors.push({
        key: 'status',
        message: 'Please provide boolean flag for enable/disable user by admin. it is required attribute',
      });
    }
    return helper.responseData(
        false,
        '',
        mainConstant.user.NO_VALID_INPUT_FOUND,
        errors,
        mainConstant.user.USER_ENABLE_DISABLE_BY_ADMIN,
    );
  }


  @Get('/newly-added-users')
  @OpenAPI({
    description: 'Get logged in user profile',
  })
  async getNewUsers(
      @HeaderParam('authorization') authToken: string,
      @Req() request: any,
      @Res() response: any
  ) {
    const data: any = await helper.isAuthenticated(authToken, request);
    if (data !== undefined) {
      if (data.status === 401) {
        return response.sendStatus(401);
      }
      const email = data.email !== undefined ? data.email : '';
      const userRepository = getRepository(User);
      let user;
      if (data.role[0].name === configConstants.SUPER_ADMIN) {
        user = await userRepository.find({
          relations: ['uploads'],
          where: { email: Not(configConstants.ADMIN_EMAIL) },
          order: {
            createdAt : 'DESC',
          },
          take: 20
        });
      }
      if (!user) {
        return helper.responseData(
            false,
            '',
            mainConstant.user.USER_NOT_FOUND,
            '',
            mainConstant.user.NEW_ADDED_USERS
        );
      }

      return helper.responseData(
          true,
          user,
          '',
          '',
          mainConstant.user.NEW_ADDED_USERS
      );
    }
    return helper.responseData(
        false,
        '',
        mainConstant.user.USER_NOT_FOUND,
        '',
        mainConstant.user.NEW_ADDED_USERS
    );
  }

  @OpenAPI({
    description: 'Admin can add category',
  })
  @Post('/add-category')
  async addCategory(
      @HeaderParam('authorization') authToken: string,
      @Body({ required: true }) body: {
        title: string,
      },
      @Req() request: any,
      @Res() response: any,
  ) {
    if (
        body.title
    ) {
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
        if (!user) {
          return helper.responseData(
              false,
              '',
              mainConstant.user.USER_NOT_FOUND,
              '',
              mainConstant.user.CATEGORY_ADD_BY_ADMIN
          );
        }
        if (user.roles[0].name !== configConstants.SUPER_ADMIN) {
          return helper.responseData(
              false,
              '',
              mainConstant.user.USER_NOT_HAVE_ADMIN_PERMISSION,
              '',
              mainConstant.user.CATEGORY_ADD_BY_ADMIN,
          );
        }
        if (body.title) {
          const categoryRepository = getRepository(Category);
          const category = new Category();
          category.title = body.title;

          await categoryRepository.save(category);

          return helper.responseData(
              true,
              category,
              mainConstant.user.NEW_CATEGORY_ADDED,
              '',
              mainConstant.user.CATEGORY_ADD_BY_ADMIN,
          );
        }
      }
      return helper.responseData(
          false,
          '',
          mainConstant.user.USER_NOT_FOUND,
          '',
          mainConstant.user.CATEGORY_ADD_BY_ADMIN,
      );
    }
    const errors: { key: string; message: string; }[] = [];
    if (!body.title) {
      errors.push({
        key: 'id',
        message: 'Please send title for perform this request. it is required attribute',
      });
    }
    return helper.responseData(
        false,
        '',
        mainConstant.user.NO_VALID_INPUT_FOUND,
        errors,
        mainConstant.user.CATEGORY_ADD_BY_ADMIN,
    );
  }


  @OpenAPI({
    description: 'Admin can add sub-category',
  })
  @Post('/add-sub-category')
  async addSubCategory(
      @HeaderParam('authorization') authToken: string,
      @Body({ required: true }) body: {
        title: string,
        categoryId: number,
      },
      @Req() request: any,
      @Res() response: any,
  ) {
    if (
        body.title &&
        body.categoryId
    ) {
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
        if (!user) {
          return helper.responseData(
              false,
              '',
              mainConstant.user.USER_NOT_FOUND,
              '',
              mainConstant.user.CATEGORY_ADD_BY_ADMIN
          );
        }
        if (user.roles[0].name !== configConstants.SUPER_ADMIN) {
          return helper.responseData(
              false,
              '',
              mainConstant.user.USER_NOT_HAVE_ADMIN_PERMISSION,
              '',
              mainConstant.user.CATEGORY_ADD_BY_ADMIN,
          );
        }
        if (body.title && body.categoryId) {
          const categoryRepository = getRepository(Category);
          const category = await categoryRepository.findOne({
            where: {
              id: body.categoryId,
            },
          });
          if(!category){
            return helper.responseData(
                false,
                '',
                mainConstant.user.CATEGORY_NOT_FOUND,
                '',
                mainConstant.user.CATEGORY_ADD_BY_ADMIN
            );
          }
          const subCategoryRepository = getRepository(SubCategory);
          const subCategory = new SubCategory();
          subCategory.title = body.title;
          subCategory.categoryId = category.id;

          await subCategoryRepository.save(subCategory);

          return helper.responseData(
              true,
              subCategory,
              mainConstant.user.NEW_CATEGORY_ADDED,
              '',
              mainConstant.user.CATEGORY_ADD_BY_ADMIN,
          );
        }
      }
      return helper.responseData(
          false,
          '',
          mainConstant.user.USER_NOT_FOUND,
          '',
          mainConstant.user.CATEGORY_ADD_BY_ADMIN,
      );
    }
    const errors: { key: string; message: string; }[] = [];
    if (!body.title) {
      errors.push({
        key: 'title',
        message: 'Please send title for perform this request. it is required attribute',
      });
    }
    if (!body.categoryId) {
      errors.push({
        key: 'categoryId',
        message: 'Please send category id for perform this request. it is required attribute',
      });
    }
    return helper.responseData(
        false,
        '',
        mainConstant.user.NO_VALID_INPUT_FOUND,
        errors,
        mainConstant.user.CATEGORY_ADD_BY_ADMIN,
    );
  }

  @Get('/get-category')
  @OpenAPI({
    description: 'Get all category',
  })
  async getCategory(
      @HeaderParam('authorization') authToken: string,
      @Req() request: any,
      @Res() response: any
  ) {
    const data: any = await helper.isAuthenticated(authToken, request);
    if (data !== undefined) {
      if (data.status === 401) {
        return response.sendStatus(401);
      }
      const email = data.email !== undefined ? data.email : '';
      const userRepository = getRepository(User);
      let user;
      if (data.role[0].name === configConstants.SUPER_ADMIN || data.role[0].name === configConstants.APP_USER) {
        user = await userRepository.findOne({
          where: {
            email,
          }
        });
      }
      if (!user) {
        return helper.responseData(
            false,
            '',
            mainConstant.user.USER_NOT_FOUND,
            '',
            mainConstant.user.GET_ALL_CATEGORY
        );
      }
      const categoryRepository = getRepository(Category);
      const category = await categoryRepository.find({
        where: {
          enable: true,
        }
      });
      return helper.responseData(
          true,
          category,
          '',
          '',
          mainConstant.user.GET_ALL_CATEGORY
      );
    }
    return helper.responseData(
        false,
        '',
        mainConstant.user.USER_NOT_FOUND,
        '',
        mainConstant.user.GET_ALL_CATEGORY
    );
  }

  @Get('/get-sub-category/:categoryId')
  @OpenAPI({
    description: 'Get all sub-category by passing categoryId',
  })
  async getSubCategory(
      @HeaderParam('authorization') authToken: string,
      @Param('categoryId') categoryId: number,
      @Req() request: any,
      @Res() response: any
  ) {
    const id = request.get('id');
    const data: any = await helper.isAuthenticated(authToken, request);
    if (data !== undefined) {
      if (data.status === 401) {
        return response.sendStatus(401);
      }
      const email = data.email !== undefined ? data.email : '';
      const userRepository = getRepository(User);
      let user;
      if (data.role[0].name === configConstants.SUPER_ADMIN || data.role[0].name === configConstants.APP_USER) {
        user = await userRepository.findOne({
          where: {
            email,
          }
        });
      }
      if (!user) {
        return helper.responseData(
            false,
            '',
            mainConstant.user.USER_NOT_FOUND,
            '',
            mainConstant.user.GET_ALL_SUB_CATEGORY
        );
      }
      const categoryRepository = getRepository(Category);
      const subCategoryRepository = getRepository(SubCategory);
      const category = await categoryRepository.findOne({
        where: {
          id: categoryId,
        }
      });
      if (!category) {
        return helper.responseData(
            false,
            '',
            mainConstant.user.CATEGORY_NOT_FOUND,
            '',
            mainConstant.user.GET_ALL_SUB_CATEGORY
        );
      }
      const subCategory = await subCategoryRepository.find({
        where: {
          categoryId: category.id,
        }
      });
      return helper.responseData(
          true,
          subCategory,
          '',
          '',
          mainConstant.user.GET_ALL_SUB_CATEGORY
      );
    }
    return helper.responseData(
        false,
        '',
        mainConstant.user.USER_NOT_FOUND,
        '',
        mainConstant.user.GET_ALL_SUB_CATEGORY
    );
  }

  @OpenAPI({
    description: 'Delete category',
  })
  @Delete('/delete-category')
  async DeleteCategory(
    @HeaderParam('authorization') authToken: string,
    @Req() request: any,
    @Res() response: any,
    @Body({ required: true }) body: BaseUpload
  ) {
    if (body.id) {
      const data: any = await helper.isAuthenticated(authToken, request);
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
        if (!user) {
          return helper.responseData(
            false,
            '',
            mainConstant.user.USER_NOT_FOUND,
            '',
            mainConstant.user.DELETE_CATEGORY
          );
        }
        const categoryRepository = getRepository(Category);
        if (user.roles[0].name === configConstants.SUPER_ADMIN) {
          try {
            await categoryRepository.delete(body.id);
            return helper.responseData(
              true,
              '',
              'Post deleted',
              '',
              mainConstant.user.DELETE_CATEGORY
            );
          } catch (error) {
            return helper.responseData(
              false,
              '',
              'Unable to delete category',
              error,
              mainConstant.user.DELETE_CATEGORY
            );
          }
        }
      }
      return helper.responseData(
        false,
        '',
        mainConstant.user.USER_NOT_FOUND,
        '',
        mainConstant.user.DELETE_CATEGORY
      );
    }
    const errors: { key: string; message: string }[] = [];
    if (!body.id) {
      errors.push({
        key: 'category',
        message: 'Please select at least one id.',
      });
    }
    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.user.DELETE_CATEGORY
    );
  }


  @OpenAPI({
    description: 'Delete sub category',
  })
  @Delete('/delete-sub-category')
  async DeleteSubCategory(
    @HeaderParam('authorization') authToken: string,
    @Req() request: any,
    @Res() response: any,
    @Body({ required: true }) body: BaseUpload
  ) {
    if (body.id) {
      const data: any = await helper.isAuthenticated(authToken, request);
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
        if (!user) {
          return helper.responseData(
            false,
            '',
            mainConstant.user.USER_NOT_FOUND,
            '',
            mainConstant.user.DELETE_SUB_CATEGORY
          );
        }
        const subCategoryRepository = getRepository(SubCategory);
        if (user.roles[0].name === configConstants.SUPER_ADMIN) {
          try {
            await subCategoryRepository.delete(body.id);
            return helper.responseData(
              true,
              '',
              'Sub category deleted',
              '',
              mainConstant.user.DELETE_SUB_CATEGORY
            );
          } catch (error) {
            return helper.responseData(
              false,
              '',
              'Unable to delete sub category',
              error,
              mainConstant.user.DELETE_SUB_CATEGORY
            );
          }
        }
      }
      return helper.responseData(
        false,
        '',
        mainConstant.user.USER_NOT_FOUND,
        '',
        mainConstant.user.DELETE_SUB_CATEGORY
      );
    }
    const errors: { key: string; message: string }[] = [];
    if (!body.id) {
      errors.push({
        key: 'subCategory',
        message: 'Please select at least one id.',
      });
    }
    return helper.responseData(
      false,
      '',
      mainConstant.auth.NO_INPUT_FOUND,
      errors,
      mainConstant.user.DELETE_SUB_CATEGORY
    );
  }
}

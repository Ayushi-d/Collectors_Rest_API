const user = {
  EMAIL_KEY: 'EMAIL_KEY',
  USERNAME_KEY: 'USERNAME_KEY',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  GET_VERIFIED_USERS: 'GET_VERIFIED_USERS',
  MY_PROFILE: 'MY_PROFILE',
  GET_ALL_CATEGORY: 'GET_ALL_CATEGORY',
  GET_ALL_SUB_CATEGORY: 'GET_ALL_SUB_CATEGORY',
  MY_WALLET: 'MY_WALLET',
  MY_NOTIFICATIONS: 'MY_NOTIFICATIONS',
  UPDATE_NOTIFICATIONS: 'UPDATE_NOTIFICATIONS',
  UPDATE_REFERRAL_RECORDS: 'UPDATE_REFERRAL_RECORDS',
  GET_ALL_USERS: 'GET_ALL_USERS',
  GET_REFERRAL_HISTORY: 'GET_REFERRAL_HISTORY',
  PAYMENT_METHOD_UPDATE: 'PAYMENT_METHOD_UPDATE',
  USER_LOCATION_UPDATE: 'USER_LOCATION_GET',
  USER_LOCATION_GET: 'USER_LOCATION_GET',
  USER_ENABLE_DISABLE_BY_ADMIN: 'USER_ENABLE_DISABLE_BY_ADMIN',
  CATEGORY_ADD_BY_ADMIN: 'CATEGORY_ADD_BY_ADMIN',
  GET_PAYMENT_METHOD: 'GET_PAYMENT_METHOD',
  GET_ALL_CARDS: 'GET_ALL_CARDS',
  SAVE_CARD: 'SAVE_CARD',
  GET_ALL_ACCOUNTS: 'GET_ALL_ACCOUNTS',
  SAVE_ACCOUNT: 'SAVE_ACCOUNT',
  PROFILE_UPDATE_SUCCESS_MESSAGE: 'Profile update successfully',
  PASSWORD_UPDATE_SUCCESS_MESSAGE: 'Password update successfully',
  CARD_ADD_SUCCESS_MESSAGE: 'Card add successfully',
  ACCOUNT_ADD_SUCCESS_MESSAGE: 'Account add successfully',
  DEFAULT_PAYMENT_ADD_SUCCESS_MESSAGE: 'Payment method add successfully',
  DEFAULT_PAYMENT_UPDATE_SUCCESS_MESSAGE: 'Payment method update successfully',
  USER_ENABLE_SUCCESS_MESSAGE: 'User enable successfully',
  USER_DISABLE_SUCCESS_MESSAGE: 'User disable successfully',
  USER_ALREADY_ENABLE: 'User already enable',
  USER_ALREADY_DISABLE: 'User already disable',
  WALLET_NOT_FOUND: 'Wallet not found',
  USER_NOT_FOUND: 'User not found',
  CATEGORY_NOT_FOUND: 'Category not found',
  SUB_CATEGORY_NOT_FOUND: 'Sub Category not found',
  POST_NOT_FOUND: 'Post not found',
  BOOKING_NOT_FOUND: 'Booking not found',
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  NOTIFICATION_MARK_AS_READ: 'Notifications mark as read successfully',
  NO_INPUT_FOUND: 'No inputs found',
  USER_ALREADY_EXIST: 'User already exist. Please change your username',
  CARD_ALREADY_EXIST: 'Card already exist.',
  ACCOUNT_ALREADY_EXIST: 'Account already exist.',
  INVALID_STATUS_FOUND: 'invalid payment method action found',
  NO_VALID_INPUT_FOUND: 'invalid inputs found',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  ACCOUNT_UPDATE: 'Account update',
  CREDENTIALS_WRONG: 'The current password is wrong. Please enter valid password.',
  USER_NOT_HAVE_PERMISSION_FOR_UPDATE_PAYMENT_METHOD: 'Only user role user can add/update payment method',
  USER_NOT_HAVE_PERMISSION_FOR_GET_PPM: 'Only driver role user can get response for this request ',
  USER_NOT_HAVE_ADMIN_PERMISSION: 'Only admin role user can update this request',
  USER_LOCATION_SUCCESS_MESSAGE: 'Location update successfully',
  REFERRAL_NOTIFICATION_TITLE: 'New referral user',
  REFERRAL_NOTIFICATION_MESSAGE: 'user used your referral code',
  USER_ADDRESS_KEY_INVALID: 'Please send valid data for save user home/work address',
  REFERRAL_UPDATE_SUCCESS_MESSAGE: 'Records update successfully',
  GET_USER_PROFILE: 'GET_USER_PROFILE',
  UPLOAD_POST: 'UPLOAD_POST',
  DELETE_POST: 'DELETE_POST',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  DELETE_SUB_CATEGORY: 'DELETE_SUB_CATEGORY',
  UPLOAD_SUCCESS: 'Post uploaded',
  UPLOAD_FAILED: 'Unable to upload post',
  NEW_ADDED_USERS: 'NEW_ADDED_USERS',
  NEW_CATEGORY_ADDED: 'Category added successfully',
};
export default user;

export class UpdateUser {

  public appType: string;

  public id: string;

  public name: string;

  public username: string;

  public email: string;

  public city: string;

  public zipCode: string;

  public address: string;

  public country: string;

  public phoneNumber: bigint;

  public paypalEmail: string;

  public currentPassword: string;

  public newPassword: string;

  public latitude: string;

  public longitude: string;

  public notificationEnable: string;

  public resendOtp: string;

  public userBio: string;

}

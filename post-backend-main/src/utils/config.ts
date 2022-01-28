const configConstants = {
  APP_USER: 'APP_USER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  SESSION_SECRET: 'SESSION_SECRET',
  JWT_EXPIRATION: '1h',
  REFRESH_JWT_EXPIRATION: '7d',
  STRIPE_TEST_SECRET_KEY: 'sk_test_51I6wdeGgL5om6155Nk9iwEneR1QuJE0O2mAC6Y6xAYA1pkgDJWdEkSNLEaS9FRO8DuhtSli3oTchzhELQkuTQXQw00MX6rWQQ6',
  STRIPE_TEST_PUBLISHABLE_KEY: 'pk_test_51I6wdeGgL5om6155WtoNANLAC4LNMFUGYB2Ct4oACDdTQ2LTwu8rbKp5RyVcrAQp6DhhN45u4YRQrLAtAVbEy8p200AUh1ZAZ7',
  SENDER_EMAIL: 'admin@test.co',
  SENDER_NAME: 'admin',
  SERVICE: 'gmail',
  HOST: 'smtp.gmail.com',
  USERNAME: 'codepab@gmail.com',
  PASSWORD: 'kfoexwxrqxbzflof',
  PORT: 2525,
  OTP_EXPIRATION: 60, // 60 minutes
  ONE_DAY_OTP_LIMIT: 5, // 5 times request for otp in one day for each user
  DEEP_LINKING_WEB_URL: 'http://3.15.188.149:3000/redirect?code=',
  ADMIN_EMAIL: 'admin@yopmail.com',
  ADMIN_PASSWORD: 'admin@123'
};

export default configConstants;

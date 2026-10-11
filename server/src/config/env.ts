import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;

const isProduction = env === 'production';
const isPlaceholderOrFallback =
  !jwtSecret ||
  jwtSecret.toLowerCase().includes('placeholder') ||
  jwtSecret.toLowerCase().includes('fallback') ||
  jwtSecret.toLowerCase().includes('change_me') ||
  jwtSecret.toLowerCase().includes('your_jwt_secret') ||
  jwtSecret.toLowerCase().includes('replace_with');

if (isProduction && isPlaceholderOrFallback) {
  throw new Error(
    'FATAL: Production environment refuses to start without a privately configured, secure JWT_SECRET.'
  );
}

export const config = {
  env,
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ventureflow',
  jwtSecret: jwtSecret || 'ventureflow_dev_only_jwt_secret_do_not_use_in_production_32chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true' || isProduction,
};

import jwt from 'jsonwebtoken';
import getenv from './getenv.js';

const TOKEN_SECRET = getenv('TOKEN_SECRET');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: '7d' });
};

export default generateAccessToken;

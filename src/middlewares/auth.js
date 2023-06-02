import jwt from 'jsonwebtoken';
import getenv from '../helpers/getenv.js';
import {
  httpForbidden,
  httpUnauthorized,
} from '../helpers/httpExceptionBuilder.js';
import { errorResponseBuilder } from '../helpers/responseBuilder.js';

const TOKEN_SECRET = getenv('TOKEN_SECRET');

export const newAuthenticator = () => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const authMethod = authHeader && authHeader?.split(' ')[0];
    const token = authHeader && authHeader?.split(' ')[1];

    if (!token)
      return res.status(401).json(errorResponseBuilder(httpUnauthorized()));

    if (authMethod != 'Bearer')
      return res
        .status(401)
        .json(
          errorResponseBuilder(
            httpUnauthorized('Must use Bearer Authentication')
          )
        );

    jwt.verify(token, TOKEN_SECRET, (err, user) => {
      if (err)
        return res.status(401).json(errorResponseBuilder(httpUnauthorized()));

      req.user = user;

      console.log('user:', user);
      next();
    });
  };
};

export const newRoleAuthorizer = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json(errorResponseBuilder(httpForbidden()));
    }
  };
};

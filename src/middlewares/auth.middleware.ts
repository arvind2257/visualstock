import { NextFunction, Response, Request } from 'express';
import { config } from '@/config.server';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import CommonHelper from '@helpers/common';
import { verify } from 'jsonwebtoken';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.cookie || !req.headers.cookie.toString().includes('admininfo')) {
      logger.warn({
        message: 'Cookie was not supplied',
        headers: req.headers,
        requestUrl: req.originalUrl,
        remote: req.ip,
      });
      const errorResponse = {};
      errorResponse['error'] = 'USER_NOT_LOGGED_IN';
      CommonHelper.getSuccessResponse(res, 401, 'Failure', true, errorResponse);
    } else {
      const lvlSession = req.cookies['admininfo'];
      const userVerify = verify(
        lvlSession,
        'EZ44mFi3TlAey1b2w4Y7lVDuqO+SRxGXsa7nctnr/JmMrA2vN6EJhrvdVZbxaQs5jpSe34X3ejFK/o9+Y5c83waog6wj70sjgz++ahpQbsxOq0F6grAAii58AAmci9==',
      );
      console.log(userVerify);
      if (lvlSession && lvlSession.length > 0) {
        const userId = userVerify?.userName;
        const userType = userVerify?.userType;
        const logged_in_user = true;
        if (userId) {
          req.body = {
            ...req.body,
            loggedInUser: logged_in_user,
            userId: userId,
            userType: userType,
          };

          next();
        } else {
          CommonHelper.getSuccessResponse(res, 401, 'Failure', true, { error: 'USER_NOT_LOGGED_IN' });
        }
      } else {
        CommonHelper.getSuccessResponse(res, 401, 'Failure', true, {
          error: 'You are not authorized for this action.',
        });
      }
    }
  } catch (error) {
    logger.error('error', error.stack);
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export const authFaircent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.header('api-key');
    if (apiKey && apiKey.toString() === config.faircentApiKey) {
      next();
    } else {
      return CommonHelper.getSuccessResponse(res, 401, 'Unauthorized', false);
    }
  } catch (error) {
    logger.error(error);
    return CommonHelper.getSuccessResponse(res, 400, 'Something very wrong', false);
  }
};

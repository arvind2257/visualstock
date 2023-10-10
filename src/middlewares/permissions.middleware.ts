import CommonHelper from '@/helpers/common';
import { CustomResponse } from '@/interfaces/response.interface';
import { logger } from '@/utils/logger';
import { NextFunction, Response, Request } from 'express';

export default class PermissionsMiddleware {
  static ensurePermission(rolePermissions) {
    return async (req: Request, res: Response | CustomResponse, next: NextFunction) => {
      try {
        const userId = req.body?.chqbookuserId;
        if (!userId) {
          return CommonHelper.getSuccessResponse(res, 401, 'Failure', true, { error: 'Missing UserId' });
        }
        let permissions, roles;
        if (rolePermissions.permissionTypes && rolePermissions.permissionTypes.length > 0) {
          //   permissions = await new JourneyModel().checkUserPermission({
          //     user_id: userId,
          //     permission_types: rolePermissions.permissionTypes,
          //   });
        }
        if (rolePermissions.roleTypes && rolePermissions.roleTypes.length > 0) {
          //   roles = await new JourneyModel().checkUserRoles({
          //     user_id: userId,
          //     names: rolePermissions.roleTypes,
          //   });
        }

        if (!permissions?.length && !roles?.length) {
          return CommonHelper.getSuccessResponse(res, 403, 'Failure', true, { error: 'You are not authorized User.' });
        }
        next();
      } catch (error) {
        logger.error(error.stack);
        return CommonHelper.getSuccessResponse(res, 403, 'Failure', false, { errors: 'Failed to check permissions' });
      }
    };
  }
}

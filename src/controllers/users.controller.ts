import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import { CreateUserDto } from '@dtos/users.dto';
import userService from '@services/users.service';
import CommonHelper from '@/helpers/common';
import CommonModel from '@/database/mysql/common';

class UsersController {
  private userService = new userService();
  private commonModel = new CommonModel();
  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filterObj = {};
      if (req.body.userType == 1) {
        res
          .status(401)
          .json({ message: 'Failure', status: false, errors: ['You have not autherized for this action'] });
      }
      if (req.body) {
        const requestBody = req.body;
        filterObj['mobile'] = requestBody.mobile ? requestBody.mobile : null;
        filterObj['username'] = requestBody.userName ? requestBody.userName : null;
        filterObj['emailid'] = requestBody.emailId ? requestBody.emailId : null;
        filterObj['usertype'] = requestBody.permissionType ? requestBody.permissionType : null;
        filterObj['status'] = requestBody.status ? requestBody.status : null;
        filterObj['limit'] = requestBody.limit ? requestBody.limit : null;
        filterObj['offset'] = requestBody.offset ? requestBody.offset : null;
      }

      const findAllUsersData: User[] = await this.userService.findAllUser(filterObj);
      delete filterObj['limit'];
      delete filterObj['offset'];
      filterObj['getCount'] = 1;

      const countData = await this.userService.findAllUser(filterObj);
      CommonHelper.getSuccessResponse(res, 200, 'Success', true, findAllUsersData, countData[0]?.counts);
    } catch (error) {
      next(error);
    }
  };

  public createUpdateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;

      const createUserData = await this.userService.createUpdateUser(userData);
      if (createUserData.status == false) {
        res
          .status(400)
          .json({ message: 'Failure', status: createUserData.status, data: {}, errors: createUserData.errors });
      } else {
        res
          .status(200)
          .json({ message: 'Created/Updated Successfully', status: createUserData.status, data: createUserData.data });
      }
    } catch (error) {
      next(error);
    }
  };

  public deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const deactivateUserData = await this.userService.deactivateUser(userData);
      if (deactivateUserData.status == false) {
        res.status(400).json({ message: 'Failure', status: deactivateUserData.status, data: deactivateUserData });
      } else {
        res
          .status(200)
          .json({ message: 'Deactivated Successfully', status: deactivateUserData.status, data: deactivateUserData });
      }
    } catch (error) {
      next(error);
    }
  };

  public userLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const deactivateUserData = await this.userService.userLogin(userData.emailid, userData.password);
      console.log(deactivateUserData);
      if (deactivateUserData.status == false) {
        res.status(400).json({ message: 'Failure', status: deactivateUserData.status, data: deactivateUserData });
      } else {
        res
          .status(200)
          .json({ message: 'Login Successfully', status: deactivateUserData.status, data: deactivateUserData });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;

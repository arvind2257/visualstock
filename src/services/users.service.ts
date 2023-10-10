import { hash } from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { isEmpty } from '@utils/util';
import UserModel from '@/database/mysql/user';
import { logger } from '@/utils/logger';
import commonModel from '@/database/mysql/common';
import CommonHelper from '@/helpers/common';
import User from '@/database/mongo/model/User';
import { sign } from 'jsonwebtoken';

export type ResType = {
  ok: boolean;
  data: object;
  msg: string;
};

export type ResponseType = {
  status: boolean;
  results: Object;
  errors: Object;
};

class UserService {
  // public users = new PrismaClient().user;
  private userModel = new UserModel();
  private commonModel = new commonModel();

  public async findAllUser(filterObj = null, customColumns = null): Promise<[]> {
    const userParams = {
      queryType: 'specific',
      customColumns:
        customColumns && customColumns !== null
          ? customColumns
          : ' userid,name,mobile,emailid,dob,address,pincode,city,is_verified,verified_by,user_type,username,companyname,status,created_at,updated_at,created_by,updated_by ',
    };
    if (filterObj) {
      userParams['mobile'] = filterObj['mobile'] ? filterObj['mobile'] : null;
      userParams['userId'] = filterObj['userId'] ? filterObj['userId'] : null;
      userParams['emaiId'] = filterObj['emailId'] ? filterObj['emailId'] : null;
      userParams['userName'] = filterObj['userName'] ? filterObj['userName'] : null;
      userParams['status'] = filterObj['status'] ? filterObj['status'] : null;
      userParams['limit'] = filterObj['limit'] ? filterObj['limit'] : null;
      userParams['offset'] = filterObj['offset'] ? filterObj['limit'] * (filterObj['offset'] - 1) : null;
      userParams['getCount'] = filterObj['getCount'] ? filterObj['getCount'] : null;
    }
    userParams['orderBy'] = filterObj['orderBy'] ? filterObj['orderBy'] : 'created_at';
    const allUser = await this.userModel.getUsersData(userParams);
    return allUser;
  }

  // public async findUserById(userId: number): Promise<User> {
  //   if (isEmpty(userId)) throw new HttpException(400, 'UserId is empty');

  //   const findUser: User = await this.users.findUnique({ where: { id: userId } });
  //   if (!findUser) throw new HttpException(409, "User doesn't exist");

  //   return findUser;
  // }

  public async createUpdateUser(userData: CreateUserDto) {
    const results = {
      status: false,
      data: {},
      errors: null,
    };

    if (isEmpty(userData)) {
      results.errors = `userData is empty`;
      return results;
    }
    const validatorParams = {
      name: 'required',
      mobile: 'required',
      emailid: 'required',
      companyname: 'required',
      password: 'required',
    };
    if (!userData.isEdit) {
      validatorParams.password = 'required';
    }
    const validator = CommonHelper.commonValidations(userData, validatorParams);
    if (validator && validator.length > 0) {
      const errorStatus = logger.error(validator);
      if (errorStatus) {
        results.errors = validator;
        return results;
      }
    } else {
      const mobileNo = userData.mobile;
      const emailId = userData.emailid;
      const findUser = await this.userModel.checkUserExists(mobileNo, emailId);

      //process.exit();
      let createUserData: User;

      if (findUser && findUser.length > 0) {
        //update user Data
        if (userData.isEdit && userData.isEdit == true) {
          userData.userId = findUser[0].userid;
          const updateData: CreateUserDto = {
            emailid: '',
            password: '',
            mobile: '',
            name: '',
            isVerified: false,
            isEdit: false,
            dob: '',
            verifiedAt: '',
            createdAt: '',
            address: '',
            userId: '',
            companyname: '',
            city: '',
            email: '',
            username: '',
          };
          updateData.emailid = userData.emailid.toLowerCase();
          updateData.name = userData.name.trim();
          if (userData.password && userData.password !== null) {
            const hashedPassword = await CommonHelper.generateSHA256Hash(userData.password);
            updateData.password = hashedPassword;
          }
          createUserData = await this.userModel.updateUser(findUser[0].id, updateData);
          results.status = true;
          results.data = { message: 'User Data Updated Successfully', username: userData.username };
        } else {
          const error = [];
          error.push(`Agent already exists`);
          results.errors = error;
          return results;
        }
      } else {
        userData.emailid = userData.emailid.toLowerCase();
        userData.name = userData.name.trim();
        userData.isVerified = true;
        userData.city = userData.city;
        userData.username = CommonHelper.createUserName(5);
        const password = userData.password;
        const hashedPassword = await CommonHelper.generateSHA256Hash(password);
        userData.password = hashedPassword;
        createUserData = await this.userModel.addUser(userData);
        const userId = createUserData ? JSON.stringify(createUserData[0]['insertId']) : null;
        results.status = true;
        userData.userId = userId;
        results.data = { message: 'User Data Created Successfully.', username: userData.username };
      }
    }
    //return CreateUserDto;
    return results;
  }

  public async deactivateUser(userId): Promise<ResponseType> {
    const results = {
      status: false,
      results: null,
      errors: null,
    };
    try {
      if (isEmpty(userId)) {
        results.errors = `userData is empty`;
        return results;
      }
      const findUser = await this.userModel.getUserById(userId);

      if (findUser && findUser.length == 0) {
        results.errors = 'No verified user exist with the details provided';
        return results;
      } else {
      }

      return results;
    } catch (error) {
      logger.error(error);
      results.errors = error;
      return results;
    }
  }

  public async userLogin(emailId: string, password: string): Promise<ResponseType> {
    const results = {
      status: false,
      data: {},
      errors: null,
    };
    try {
      if (isEmpty(emailId) || isEmpty(password)) {
        results.errors = `Email id and password should not be blank`;
        return results;
      }
      const hashedPassword = await CommonHelper.generateSHA256Hash(password);
      const findUser = await this.userModel.checkUserLogin(emailId, hashedPassword);

      if (findUser && findUser.length == 0) {
        results.errors = 'Invalid user name and password has entered ' + hashedPassword;
        return results;
      } else {
        if (findUser[0].status == 0) {
          results.errors = 'User is not active.';
        } else {
          console.log(findUser);
          results.status = true;
          const token = sign(
            { userName: findUser[0].username, userType: findUser[0].user_type },
            'EZ44mFi3TlAey1b2w4Y7lVDuqO+SRxGXsa7nctnr/JmMrA2vN6EJhrvdVZbxaQs5jpSe34X3ejFK/o9+Y5c83waog6wj70sjgz++ahpQbsxOq0F6grAAii58AAmci9==',
            {
              expiresIn: '2h',
            },
          );
          results.data = { token: token, userId: findUser[0].username };
        }
      }

      return results;
    } catch (error) {
      logger.error(error);
      results.errors = error;
      return results;
    }
  }
}

export default UserService;

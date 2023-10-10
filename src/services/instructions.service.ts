import { hash } from 'bcrypt';
import { isEmpty } from '@utils/util';
import InstructionModel from '@/database/mysql/instructions';
import { logger } from '@/utils/logger';
import commonModel from '@/database/mysql/common';
import CommonHelper from '@/helpers/common';

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

class InstructionService {
  // public users = new PrismaClient().user;
  private instructionModel = new InstructionModel();
  private commonModel = new commonModel();

  public async findAll(filterObj = null, customColumns = null): Promise<[]> {
    const userParams = {
      queryType: 'specific',
      customColumns:
        customColumns && customColumns !== null
          ? customColumns
          : ' * ',
    };
    if (filterObj) {
      userParams['title'] = filterObj['title'] ? filterObj['title'] : null;
      userParams['userId'] = filterObj['userId'] ? filterObj['userId'] : null;
      userParams['status'] = filterObj['status'] ? filterObj['status'] : null;
      userParams['limit'] = filterObj['limit'] ? filterObj['limit'] : null;
      userParams['offset'] = filterObj['offset'] ? filterObj['limit'] * (filterObj['offset'] - 1) : null;
      userParams['getCount'] = filterObj['getCount'] ? filterObj['getCount'] : null;
    }
    userParams['orderBy'] = filterObj['orderBy'] ? filterObj['orderBy'] : 'created_at';
    const allUser = await this.instructionModel.getInstructionData(userParams);
    return allUser;
  }

  // public async findUserById(userId: number): Promise<User> {
  //   if (isEmpty(userId)) throw new HttpException(400, 'UserId is empty');

  //   const findUser: User = await this.users.findUnique({ where: { id: userId } });
  //   if (!findUser) throw new HttpException(409, "User doesn't exist");

  //   return findUser;
  // }

  public async createUpdateUser(instructionData) {
    const results = {
      status: false,
      data: {},
      errors: null,
    };

    if (isEmpty(instructionData)) {
      results.errors = `userData is empty`;
      return results;
    }
    const validatorParams = {
      title: 'required',
      userid: 'required',
      insdetail: 'required',
    };
    const validator = CommonHelper.commonValidations(instructionData, validatorParams);
    if (validator && validator.length > 0) {
      const errorStatus = logger.error(validator);
      if (errorStatus) {
        results.errors = validator;
        return results;
      }
    } else {
      const insId = instructionData.insid;
      const findInstruction = await this.instructionModel.checkInstructionExists(insId);

      if (findInstruction && findInstruction.length > 0) {
        //update user Data
        if (instructionData.isEdit && instructionData.isEdit == true) {
          instructionData.userId = findInstruction[0].userid;
          const updateData = {
            userid: instructionData && instructionData.userid ? instructionData.userid : null,
            title: instructionData && instructionData.title ? instructionData.title : null,
            image_size: instructionData && instructionData.imagesize ? instructionData.imagesize : null,
            file_delivery_format: instructionData && instructionData.filedeliveryformat ? instructionData.filedeliveryformat : null,
            img_resolution: instructionData && instructionData.imgresolution ? instructionData.imgresolution : null,
            ins_detail: instructionData && instructionData.insdetail ? instructionData.insdetail : null,
          };
          updateData.title = instructionData.title.trim();
          const createInstructionData = await this.instructionModel.updateInstruction(findInstruction[0].ins_id, updateData);
          results.status = true;
          results.data = { message: 'Instruction Data Updated Successfully' };
        } else {
          const error = [];
          error.push(`Instruction already exists`);
          results.errors = error;
          return results;
        }
      } else {
        const createInstructionData = await this.instructionModel.addInstruction(instructionData);
        const insId = createInstructionData ? JSON.stringify(createInstructionData[0]['insertId']) : null;
        results.status = true;
        results.data = { message: 'Instruction Data Created Successfully.', insId: insId };
      }
    }
    //return CreateUserDto;
    return results;
  }
}

export default InstructionService;

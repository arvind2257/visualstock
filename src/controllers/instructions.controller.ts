import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import instructionService from '@services/instructions.service';
import CommonHelper from '@/helpers/common';
import CommonModel from '@/database/mysql/common';

class InstructionsController {
  private instructionService = new instructionService();
  private commonModel = new CommonModel();
  public getInstructions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filterObj = {};
      if (req.body.userType == 1) {
        res
          .status(401)
          .json({ message: 'Failure', status: false, errors: ['You have not autherized for this action'] });
      }
      if (req.body) {
        const requestBody = req.body;
        filterObj['title'] = requestBody.title ? requestBody.title : null;
        filterObj['userid'] = requestBody.userid ? requestBody.userid : null;
        filterObj['insid'] = requestBody.insid ? requestBody.insid : null;
        filterObj['status'] = requestBody.status ? requestBody.status : null;
        filterObj['limit'] = requestBody.limit ? requestBody.limit : null;
        filterObj['offset'] = requestBody.offset ? requestBody.offset : null;
      }

      const findAllData: User[] = await this.instructionService.findAll(filterObj);
      delete filterObj['limit'];
      delete filterObj['offset'];
      filterObj['getCount'] = 1;

      const countData = await this.instructionService.findAll(filterObj);
      CommonHelper.getSuccessResponse(res, 200, 'Success', true, findAllData, countData[0]?.counts);
    } catch (error) {
      next(error);
    }
  };

  public createUpdateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructionData = req.body;

      const createInstructionData= await this.instructionService.createUpdateUser(instructionData);
      if (createInstructionData.status == false) {
        res
          .status(400)
          .json({ message: 'Failure', status: createInstructionData.status, data: {}, errors: createInstructionData.errors });
      } else {
        res
          .status(200)
          .json({ message: 'Created/Updated Successfully', status: createInstructionData.status, data: createInstructionData.data });
      }
    } catch (error) {
      next(error);
    }
  };


}

export default InstructionsController;

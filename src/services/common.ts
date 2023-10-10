import { Workbook } from 'exceljs';
import { transporter } from '@utils/nodemailer';
import { logger } from '@utils/logger';
import { EmailData } from '@/interfaces/nodemailer.interface';
//import { config } from 'dotenv';
const Jimp = require('jimp');
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import CommonModel, { getCommonResParams } from '@/database/mysql/common';
import MiscModel from '@/database/mysql/misc';
import { config } from '@/config.server';
//TODO: add safe checks in all functions
import documentModel, { docResParams, mediaResParams } from '@/database/mysql/document';
import fs from 'fs';
import { format } from 'date-fns';
import ApiModel from '@/database/mysql/api';
import { performance } from 'perf_hooks';
import CommonHelper from '@/helpers/common';
import redis from '@/utils/ioredis.utils';
interface SendFileToEmailFromS3 {
  bucket?: string;
  pathKey?: string;
  fileName?: string;
  emailData: EmailData;
}

interface SaveWorkbookAndUploadToS3 {
  workbook: Workbook;
  s3FilePath: string;
  bucket: string;
}
interface fileProcess {
  fileId: string;
  transactionId: string;
  password?: string;
}

interface cityData {
  cityName?: string;
  stateName?: string;
  pincode: number;
}

const sendEmail = (emailData: EmailData) =>
  transporter.sendMail(emailData, (err, info) => {
    if (err) {
      logger.error(`sendEmail: ${err.stack}`);
    }
    logger.info(`Email Sent, Envelope: ${info.envelope}, MessageId: ${info.messageId}`);
  });

export const addCityStateOfPincode = async (cityName: string, stateName: string) => {
  const commonModel = new CommonModel();
  if (!cityName) return cityName;

  const table = config.tableNames.cities;
  const countParams: getCommonResParams = {
    queryType: 'specific',
    conditionColumns: {
      city_name: `'${cityName}'`,
    },
    customColumns: ' city_id,state_id',
  };
  const data = [];
  const checkCity = await commonModel.getCommonQueryFetch(countParams, table);
  if (checkCity && checkCity.length > 0) {
    data['cityId'] = checkCity[0].city_id;
    data['stateId'] = checkCity[0].state_id;
  } else {
    //insert into city and check state and insert state if not available
    const table = config.tableNames.states;
    const countParams: getCommonResParams = {
      queryType: 'specific',
      conditionColumns: {
        name: `'${stateName}'`,
      },
      customColumns: ' id',
    };
    const checkState = await commonModel.getCommonQueryFetch(countParams, table);
    let stateId = '';
    let cityId = '';
    if (checkState && checkState.length > 0) {
      stateId = checkState[0].id;
    } else {
      const stateParams = {
        stateName: stateName,
      };

      const stateData = await commonModel.addStateData(stateParams);
      stateId = JSON.stringify(stateData[0]['insertId']);
    }
    if (stateId && stateId != null) {
      const cityParams = {
        cityName: cityName,
        stateId: stateId,
      };

      const cityData = await commonModel.addCityData(cityParams);
      cityId = JSON.stringify(cityData[0]['insertId']);
    }
    data['cityId'] = cityId;
    data['stateId'] = stateId;
  }
  return data;
};
function getFileStream(bucket: string, pathKey: string) {
  throw new Error('Function not implemented.');
}

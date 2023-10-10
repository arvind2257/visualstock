import axios from 'axios';
import { logger } from '../logger';
import { config } from '@/config.server';
//import { base } from '@/constants';
import * as uuid from 'uuid';
import short from 'short-uuid';
import crypto from 'node:crypto';
import https from 'https';

export async function bbpsFetchMDMDataRequest(requestBody: any): Promise<any> {
  try {
    const response = await axios({
      url: config.bbps.baseUrl,
      method: 'post',
      data: requestBody,
      httpsAgent: new https.Agent({
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
      }),
    });
    if (response.data.ResponseCode === '00') {
      return response.data;
    }
    logger.error(JSON.stringify(response.data));
  } catch (error) {
    logger.error(error.stack);
  }
}

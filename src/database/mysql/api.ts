import { runQuery } from '@utils/mysql';
import { logger } from '@utils/logger';
import { format } from 'date-fns';
import CommonHelper from '@/helpers/common';

export type apiDataReqParams = {
  user_id: number;
  object_type?: number;
  object_id?: number;
  response_status?: number;
  response_time?: number;
  url?: string;
  request_headers_pub?: string;
  request_params_pub?: string;
  response_params_pub?: string;
  created_by?: number;
  created_at?: string;
};
export default class ApiModel {
  public async addTpApiAccessData(data) {
    const results = [];
    if (!data) {
      return results;
    }

    if (data && data.request_headers) {
      data.request_headers = JSON.stringify(data.request_headers);
    }

    if (data && data.request_params) {
      data.request_params = JSON.stringify(data.request_params);
    }

    if (data && data.response_params) {
      data.response_params = JSON.stringify(data.response_params);
    }

    data = CommonHelper.cbPiiEncrypter(data, true);

    const apiData: apiDataReqParams = {
      user_id: data.user_id ? data.user_id : null,
      object_type: data.object_type ? data.object_type : null,
      object_id: data.object_id ? data.object_id : null,
      response_status: data.response_status ? data.response_status : null,
      response_time: data.response_time ? data.response_time : null,
      url: data.url ? data.url : null,
      request_headers_pub: data.request_headers_pub ? data.request_headers_pub : null,
      request_params_pub: data.request_params_pub ? data.request_params_pub : null,
      response_params_pub: data.response_params_pub ? data.response_params_pub : null,
      created_by: data.created_by ? data.created_by : 1,
      created_at: data.created_at ? data.created_at : format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    if (apiData) {
      const columns = Object.keys(apiData);
      const values = Object.values(apiData);
      const sql = `
        INSERT INTO tp_api_access (${columns.map(col => col).join(',')})
        VALUES (${values.map(() => '?').join(',')})
      `;

      try {
        const insertObjResp = await runQuery(sql, values);
        return insertObjResp;
      } catch (error) {
        logger.error(error);
      }
    }
  }

  public async updateTpApiAccessData(id: number | string, data) {
    const results = [];
    if (!data) {
      return results;
    }

    if (!id) {
      return results;
    }

    if (data && data.request_headers) {
      data.request_headers = JSON.stringify(data.request_headers);
    }

    if (data && data.request_params) {
      data.request_params = JSON.stringify(data.request_params);
    }

    if (data && data.response_params) {
      data.response_params = JSON.stringify(data.response_params);
    }

    data = CommonHelper.cbPiiEncrypter(data);

    let sql = `UPDATE tp_api_access`;

    const update_keys = Object.keys(data);
    if (update_keys.length) {
      sql += ` SET`;
      update_keys.forEach(column_name => {
        sql += ` ${column_name} = ${data[column_name]},`;
      });
      // to remove extra comma from the end
      sql = sql.slice(0, -1);
    }
    sql += ` WHERE id=${id}`;
    try {
      const ubdateObjResp = await runQuery(sql);
      return ubdateObjResp;
    } catch (error) {
      logger.error(error);
    }
  }
}

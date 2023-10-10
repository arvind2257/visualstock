import { runQuery } from '@utils/mysql';
import { logger } from '@utils/logger';
import { conditionalUpdateParams } from './perfios';

import { format } from 'date-fns';
export type getCityAndStateNameParams = {
  cityname: string;
  statename: string;
};
export type getCommonResParams = {};

export default class CommonModel {
  public async getCityAndStateName(city_id: number): Promise<getCityAndStateNameParams> {
    const sql = `select city_name as cityName, name as stateName,city_id as cityId,state_id as stateId from cities inner join states on cities.state_id = states.id where city_id = ${city_id}`;
    try {
      const getObjResp = await runQuery(sql);

      return getObjResp[0];
    } catch (error) {
      logger.error(error);
    }
  }

  public async conditionalUpdate(data: conditionalUpdateParams) {
    let sql = `UPDATE ${data.table_name}`;

    const update_keys = Object.keys(data.update_data);
    if (update_keys.length) {
      sql += ` SET`;
      update_keys.forEach(column_name => {
        sql += ` ${column_name} = ${data.update_data[column_name]},`;
      });
      // to remove extra comma from the end
      sql = sql.slice(0, -1);
    }
    if (data.condition_data) {
      sql += ` WHERE 1`;
      const condition_keys = Object.keys(data.condition_data);
      condition_keys.forEach(column_name => {
        sql += ` AND ${column_name} = ${data.condition_data[column_name]}`;
      });
    }

    try {
      const ubdateObjResp = await runQuery(sql);
      return ubdateObjResp;
    } catch (error) {
      logger.error(error);
    }
  }

  public async getCommonQueryFetch(data = null, table = null): Promise<getCommonResParams> {
    let sql: string;
    if (data && data.queryType == 'specific' && data.customColumns) {
      sql = `SELECT ${data.customColumns} FROM ${table} WHERE 1`;
    } else if (data && data.queryType == 'getCount') {
      sql = `SELECT COUNT(*) AS count FROM ${table} WHERE 1`;
    } else {
      sql = `SELECT * FROM ${table} WHERE  1`;
    }
    if (data && data.conditionColumns) {
      Object.entries(data.conditionColumns).forEach(async ([key, value]) => {
        if (key && value) {
          if (value == 'NOTNULL') {
            sql += ` AND ${table}.${key} is not null`;
          } else if (value == 'ISNULL') {
            sql += `  AND ${table}.${key} is null`;
          } else {
            sql += ` AND ${table}.${key} =${value}`;
          }
        }
      });
    }
    if (data && data.orderBy) {
      sql += ` ORDER BY ${data.orderBy} DESC`;
    }
    try {
      const result = await runQuery(sql);

      return result[0];
    } catch (error) {
      logger.error(error);
    }
  }

  public async updateLeadprofile(lead_id: string, data = null) {
    if (!lead_id) {
      return false;
    }

    if (data) {
      let sql = `UPDATE lead_profiles`;
      const update_keys = Object.keys(data);
      if (update_keys.length) {
        sql += ` SET`;
        update_keys.forEach(column_name => {
          sql += ` ${column_name} = '${data[column_name]}',`;
        });
        // to remove extra comma from the end
        sql = sql.slice(0, -1);
      }
      sql += ` where 1 and lead_id=${lead_id}`;

      try {
        const ubdateObjResp = await runQuery(sql);
        return ubdateObjResp;
      } catch (error) {
        logger.error(error);
      }
    }
  }

  public async addCityData(data) {
    const results = [];
    if (!data) {
      return results;
    }

    const cityData = {
      city_name: data.cityName ? data.cityName : null,
      city_code: data.cityCode ? data.cityCode : null,
      enabled_in_pl: 1,
      state_id: data.stateId ? data.stateId : null,
    };

    if (cityData) {
      const columns = Object.keys(cityData);
      const values = Object.values(cityData);
      const sql = `
        INSERT INTO cities (${columns.map(col => col).join(',')})
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

  public async updateUserData(user_id: Number, data = null) {
    if (!user_id) {
      return false;
    }

    if (data) {
      let sql = `UPDATE users`;
      const update_keys = Object.keys(data);
      if (update_keys.length) {
        sql += ` SET`;
        update_keys.forEach(column_name => {
          sql += ` ${column_name} = '${data[column_name]}',`;
        });
        // to remove extra comma from the end
        sql = sql.slice(0, -1);
      }
      sql += ` where 1 and id=${user_id}`;

      try {
        const ubdateObjResp = await runQuery(sql);
        return ubdateObjResp;
      } catch (error) {
        logger.error(error);
      }
    }
  }

  public async addStateData(data) {
    const results = [];
    if (!data) {
      return results;
    }

    const stateData = {
      name: data.stateName ? data.stateName : null,
      state_code: data.stateCode ? data.stateCode : null,
      cteated_by: data.created_by ? data.created_by : 1,
      created_at: data.created_at ? data.created_at : format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    if (stateData) {
      const columns = Object.keys(stateData);
      const values = Object.values(stateData);
      const sql = `
        INSERT INTO states (${columns.map(col => col).join(',')})
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
}

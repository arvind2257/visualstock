import { runQuery, getKnexInstance } from '@utils/mysql';
import { logger } from '@utils/logger';
import config from '@/config/default';
import { CreateUserDto } from '@/dtos/users.dto';
import { format } from 'date-fns';
import { isArray } from 'class-validator';

export default class InstructionModel {
  private db = getKnexInstance;

  public async checkInstructionExists(insId: number) {
    const sql = `SELECT ins_id FROM ${config.tableNames.instructions} WHERE userid=${insId}`;
    try {
      const getObjResp = await runQuery(sql);
      return getObjResp[0];
    } catch (error) {
      logger.error(error);
      return [];
    }
  }

  public async getInstructionData(data): Promise<[]> {
    if (!data) return null;
    let sql = `SELECT ` + data.customColumns + `FROM ${config.tableNames.instructions} WHERE 1`;
    if (data && data.getCount) {
      sql = `SELECT count(*) counts FROM ${config.tableNames.instructions} WHERE 1`;
    }
    if (data && data.insId) {
      if (isArray(data.insId)) {
        sql += ` AND ins_id IN (`;
        for (const userVal of data.insId) {
          sql += `'${userVal}',`;
        }
        sql = sql.slice(0, -1);
        sql += `)`;
      } else {
        sql += ` AND ins_id = ${data.insId} `;
      }
    }
    if (data && data.userId) {
      if (isArray(data.userId)) {
        sql += ` AND userid IN (`;
        for (const userVal of data.userId) {
          sql += `'${userVal}',`;
        }
        sql = sql.slice(0, -1);
        sql += `)`;
      } else {
        sql += ` AND userid = ${data.userId} `;
      }
    }
    if (data && data.title) {
      sql += ` AND title= ${data.title}`;
    }
    if (data && data.titlelike) {
      sql += ` AND title like  %${data.emailId}%`;
    }
    if (data && data.status) {
      sql += ` AND status= ${data.status}`;
    } else {
      sql += ` AND status= 1`;
    }
    sql += ` ORDER BY ${data.orderBy} DESC`;
    if (data && data.limit && data.offset) {
      sql += ` limit ${data.offset}, ${data.limit}`;
    }
    try {
      const getObjResp = await runQuery(sql);
      const response = [];
      if (getObjResp && getObjResp[0].length > 0) {
        for (const value of getObjResp[0]) {
          response.push(value);
        }
      }
      return response;
    } catch (error) {
      logger.error(error);
    }
  }

  public async addInstruction(data = null) {
    const results = [];
    if (!data) {
      return results;
    }
    const insertedData = {
      userid: data && data.userId ? data.userId : null,
      title: data && data.title ? data.title : null,
      image_size: data && data.imagesize ? data.imagesize : null,
      file_delivery_format: data && data.filedeliveryformat ? data.filedeliveryformat : null,
      img_resolution: data && data.imgresolution ? data.imgresolution : null,
      ins_detail: data && data.insdetail ? data.insdetail : null,
      created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      created_by: data && data.createdBy ? data.createdBy : null,
    };

    //process.exit();
    if (insertedData) {
      const columns = Object.keys(insertedData);
      const values = Object.values(insertedData);
      const table = config.tableNames.instructions;
      const sql = `
        INSERT INTO ${table} (${columns.map(col => col).join(',')})
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

  public async updateInstruction(insId: number, data = null) {
    if (!insId) {
      return false;
    }

    if (data) {
      data.updated_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      data.updated_by = data.userid;
      let sql = `UPDATE ${config.tableNames.instructions}`;
      const update_keys = Object.keys(data);
      if (update_keys.length) {
        sql += ` SET`;
        update_keys.forEach(column_name => {
          sql += ` ${column_name} = '${data[column_name]}',`;
        });
        // to remove extra comma from the end
        sql = sql.slice(0, -1);
      }
      sql += ` where 1 and ins_id=${insId}`;

      try {
        const ubdateObjResp = await runQuery(sql);
        return ubdateObjResp;
      } catch (error) {
        logger.error(error);
      }
    }
  }
}

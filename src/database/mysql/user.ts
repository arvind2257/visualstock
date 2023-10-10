import { runQuery, getKnexInstance } from '@utils/mysql';
import { logger } from '@utils/logger';
import config from '@/config/default';
import { CreateUserDto } from '@/dtos/users.dto';
import { format } from 'date-fns';
import { isArray } from 'class-validator';

export type getUserParams = {
  name?: string;
  userid?: number;
  dob?: string;
  city?: string;
  verified_by?: number;
  address?: string;
  status?: boolean;
  is_verified?: boolean;
  user_type?: string;
  emailid?: string;
  mobile?: string | number;
  company_name?: string;
  username: string | number;
};

export default class UserModel {
  private db = getKnexInstance;

  public async getAgentName(created_by: number): Promise<getUserParams> {
    const sql = `select username from users where id = ${created_by}`;
    try {
      const getObjResp = await runQuery(sql);

      return getObjResp[0];
    } catch (error) {
      logger.error(error);
    }
  }

  public async getUserById(userId: number) {
    const sql = `SELECT * FROM ${config.tableNames.users} WHERE userid=${userId}`;
    try {
      const getObjResp = await runQuery(sql);
      return getObjResp[0];
    } catch (error) {
      logger.error(error);
      return [];
    }
  }

  public async getUsersData(data): Promise<[]> {
    if (!data) return null;
    let sql = `SELECT ` + data.customColumns + `FROM users WHERE 1`;
    if (data && data.getCount) {
      sql = `SELECT count(*) counts FROM users WHERE 1`;
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
    if (data && data.userName) {
      sql += ` AND username= ${data.userName}`;
    }
    if (data && data.emailId) {
      sql += ` AND emailid= ${data.emailId}`;
    }
    if (data && data.mobile) {
      sql += ` AND mobile= ${data.mobile}`;
    }
    if (data && data.status) {
      sql += ` AND status= ${data.status}`;
    } else {
      sql += ` AND status= 1`;
    }
    if (data && data.userType) {
      sql += ` AND user_type= ${data.userType}`;
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

  public async addUser(data: CreateUserDto = null) {
    const results = [];
    if (!data) {
      return results;
    }
    const insertedData = {
      dob: data && data.dob ? data.dob : null,
      city: data && data.city ? data.city : null,
      pincode: data && data.pincode ? data.pincode : null,
      user_type: data && data.userType ? data.userType : null,
      is_verified: data && data.isVerified ? data.isVerified : 0,
      password: data.password,
      username: data.username,
      created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      created_by: data && data.createdBy ? data.createdBy : null,
      name: data && data.name ? data.name : null,
      emailid: data && data.emailid ? data.emailid : null,
      mobile: data && data.mobile ? data.mobile : null,
      address: data && data.address ? data.address : null,
      companyname: data && data.companyname ? data.companyname : null,
    };

    //process.exit();
    if (insertedData) {
      const columns = Object.keys(insertedData);
      const values = Object.values(insertedData);
      const table = config.tableNames.users;
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

  public async updateUser(user_id: string, data = null) {
    if (!user_id) {
      return false;
    }

    if (data) {
      data.updated_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      data.updated_by = user_id;
      if (data && data.emailid) {
        data.emailid = data.emailid.replaceAll("'", '');
      }
      if (data && data.name) {
        data.name = data.name.replaceAll("'", '');
      }
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
      sql += ` where 1 and userid=${user_id}`;

      try {
        const ubdateObjResp = await runQuery(sql);
        return ubdateObjResp;
      } catch (error) {
        logger.error(error);
      }
    }
  }

  public async getUserData(userId: number) {
    const user = await this.getUserById(userId);
    if (!user?.length) return {};
    const userData = user[0];
    userData.name = userData.name;
    userData.email = userData.email;
    userData.mobile = userData.mobile;
    userData.address = userData.address;

    return userData;
  }

  public async checkUserExists(mobile: string, emailId: string): Promise<any> {
    const sql = `SELECT userid FROM users WHERE mobile = '${mobile}' or emailid = '${emailId}';`;
    try {
      const getObjResp = await runQuery(sql);

      return getObjResp[0];
    } catch (error) {
      logger.error(error);
    }
  }

  public async checkUserIdValid(userId: number): Promise<[]> {
    try {
      const result = await this.db().select('id').from('users').where('id', userId).first();
      return result;
    } catch (error) {
      logger.error(error);
    }
  }

  public async checkUserPermission(userId: number, permissionId: number): Promise<void> {
    const sql = `select userid from users where user_id=${userId} and user_type=${permissionId} and status=1`;
    try {
      const result = await runQuery(sql);
      return result[0];
    } catch (error) {
      logger.error(error);
    }
  }

  public async checkUserLogin(emailId: string, password: string): Promise<any> {
    const sql = `select username,user_type,emailid,password from users where (mobile = '${emailId}' or emailid = '${emailId}') and password='${password}'`;
    try {
      const result = await runQuery(sql);
      return result[0];
    } catch (error) {
      logger.error(error);
    }
  }
}

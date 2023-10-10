import { runQuery } from '@utils/mysql';
import { logger } from '@utils/logger';

export type getLeadStausesResParams = {};
export default class MiscModel {
  public async getLeadStatusesData(data = null): Promise<getLeadStausesResParams[]> {
    let sql: string;

    sql = `SELECT * FROM lead_statuses WHERE 1`;

    if (data && data.admin_status_id) {
      sql += ` AND lead_statuses.id = ${data.admin_status_id}`;
    }

    if (data && data.admin_status_text) {
      sql += ` AND lead_statuses.admin_status_text = = ${data.admin_status_text}`;
    }

    if (data && data.product_id) {
      sql += ` AND lead_statuses.product_id = = ${data.product_id}`;
    }

    if (data && data.valid_master_lead_status) {
      sql += ` AND lead_statuses.lead_status IS NOT NULL`;
    }

    if (data && data.visible) {
      sql += ` AND lead_statuses.visible = 1`;
    }

    if (data && data.get_master_lead_statuses) {
      sql += ` GROUP BY lead_statuses.lead_status ORDER BY lead_statuses.lead_status ASC`;
    } else {
      sql += ` ORDER BY lead_statuses.id ASC`;
    }

    if (data && data.limit) {
      sql += ` LIMIT ${data.limit} `;
    }

    try {
      const result = await runQuery(sql);

      return result[0];
    } catch (error) {
      logger.error(error);
    }
  }
  public async getPostpinData(data = null): Promise<any> {
    let sql: string;
    sql = `SELECT pincode, city_name,
       state_name, district_name,
       region_name /*added by kanika jain 26 august */
       FROM india_postpin
       WHERE 1 `;
    if (data.pincode && data) {
      sql += `AND pincode = ${data.pincode}`;
    }

    if (data.q && data) {
      sql += `AND pincode LIKE ${data.q}%`;
    }
    if (data && data.limit) {
      sql += `LIMIT ${data.limit}`;
    }
    try {
      const result = await runQuery(sql);
      if (data.getPin) {
        return result[0];
      }
    } catch (error) {
      logger.error(error);
    }
  }
  public async getCities(data = null): Promise<any> {
    let sql: string;
    sql = `SELECT cities.*, cities.city_name AS city,
             pretty_names.pretty_name, states.id, states.name AS state_name,
            states.state_code
            FROM cities
            LEFT JOIN pretty_names ON pretty_names.object_id = cities.city_id AND pretty_names.object_type = 4 
            LEFT JOIN states ON states.id = cities.state_id
            WHERE 1 `;

    if (data && data.city_id) {
      sql += ` AND cities.city_id = ${data.city_id} `;
    }
    if (data && data.city_name) {
      sql += ` AND cities.city_name = ${data.city_name} `;
    }
    if (data && data.city_code) {
      sql += ` AND cities.city_code = ${data.city_code} `;
    }
    if (data && data.enabled_in_hl) {
      sql += ` AND cities.enabled_in_hl = 1 `;
    }
    if (data && data.enabled_in_pl) {
      sql += ` AND cities.enabled_in_pl = 1 `;
    }
    if (data && data.enabled_in_bl) {
      sql += ` AND cities.enabled_in_bl = 1 `;
    }
    if (data && data.enabled_in_cc) {
      sql += ` AND cities.enabled_in_cc = 1 `;
    }
    if (data && data.prettyName) {
      sql += ` AND pretty_names.pretty_name = '${data.prettyName}' `;
    }
    if (data && data.q) {
      sql += `  AND cities.city_name LIKE %${data.q}% `;
    }
    if (data && data.regexp_search) {
      sql += ` AND pretty_names.pretty_name REGEXP ${data.regexp_search}`;
    }
    if (data && data.status >= 0) {
      sql += `AND cities.status = ${data.status}`;
    }
    if (data && data.state_id) {
      sql += ` AND cities.state_id = ${data.state_id} `;
    }
    // sql += ` GROUP BY cities.city_id `;
    if (data && data.limit) {
      sql += `LIMIT ${data.limit}`;
    }
    try {
      const result = await runQuery(sql);
      if (data.getCity) {
        return result[0];
      }
    } catch (error) {
      logger.error(error);
      return [];
    }
  }
}

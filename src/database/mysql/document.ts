import { runQuery } from '@utils/mysql';
import { config } from '@/config.server';
import { format } from 'date-fns';
import { logger } from '@utils/logger';
export type mediaResParams = {
  object_id: number;
  object_type: number;
  doc_type: number;
  file_size: number;
  password?: string;
  display_size: string | number;
  title: string;
  type: string;
  verification_type?: string;
  disk: string;
  status: number;

  file_name: string;
  file_path: string;
  storage_type: number;
  created_by: number;
  created_at?: string;
};
export type docResParams = {
  lead_id: number;
  media_file_id: string | number;
  verification_status: boolean;
  status: number;
  is_completed?: number;
  doc_type: number;
  provider_response?: string;
  doc_session_id?: string;
  created_by: number;
  created_at?: string;
};
export default class documentModel {
  public async inserMediaData(data = null): Promise<mediaResParams[]> {
    const results = [];
    if (!data) {
      return results;
    }
    // data.created_by = 1;

    const insertedData = {
      object_id: data.object_id ? data.object_id : 0,
      object_type: data.object_type ? data.object_type : null,
      doc_type: data.doc_type ? data.doc_type : null,
      file_size: data.file_size ? data.file_size : null,
      password: data.password ? data.password : null,
      display_size: data.display_size ? data.display_size : null,
      title: data.title ? data.title : null,
      type: data.type ? data.type : null,
      verification_type: data.verification_type ? data.verification_type : null,
      disk: data.disk ? data.disk : null,
      status: data.status ? data.status : 1,

      file_name: data.file_name ? data.file_name : null,
      file_path: data.file_path ? data.file_path : null,
      storage_type: data.storage_type ? data.storage_type : null,
      created_by: data.created_by ? data.created_by : null,
      created_at: data.created_at ? data.created_at : format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    if (insertedData) {
      const columns = Object.keys(insertedData);
      const values = Object.values(insertedData);
      const sql = `
        INSERT INTO media_files (${columns.map(col => col).join(',')})
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
  public async inserDocData(data = null): Promise<docResParams[]> {
    const results = [];
    if (!data) {
      return results;
    }

    const insertedData = {
      lead_id: data.lead_id ? data.lead_id : 0,
      media_file_id: data.media_file_id ? data.media_file_id : null,
      verification_status: data.verification_status ? data.verification_status : null,
      status: data.status ? data.status : null,
      is_completed: data.is_completed ? data.is_completed : null,
      doc_type: data.doc_type ? data.doc_type : null,
      provider_response: data.provider_response ? data.provider_response : null,
      doc_session_id: data.doc_session_id || null,
      created_by: data.created_by ? data.created_by : null,
      created_at: data.created_at ? data.created_at : format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    if (insertedData) {
      const columns = Object.keys(insertedData);
      const values = Object.values(insertedData);
      const sql = `
        INSERT INTO lead_docs (${columns.map(col => col).join(',')})
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

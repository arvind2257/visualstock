import { getKnexInstance as knex } from '@utils/mysql';
import { logger } from '@utils/logger';

export type getInstrumentsParams = {
  [x: string]: any;
  id: number;
};

export default class InstrumentsModel {
  public async getAllInstruments(product_id: number): Promise<getInstrumentsParams> {
    try {
      const query = await knex()
        .select(knex().raw('GROUP_CONCAT(id SEPARATOR ",") as instrument_id'))
        .from('instruments_new')
        .where('product_id', product_id)
        .andWhere('status', 1);

      return query[0].instrument_id;
    } catch (error) {
      logger.error(error.stack);
    }
  }
}

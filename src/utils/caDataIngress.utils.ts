import { serviceResponse } from '@/interfaces/service.interface';
import { format } from 'date-fns';

export const validateIngressData = (body, file): serviceResponse => {
  if (!body?.chqbookuserId)
    return {
      ok: false,
      err: 'Invalid User',
    };

  if (!file?.buffer || file?.mimetype != 'text/csv')
    return {
      ok: false,
      err: 'Invalid File',
    };

  const stmtDate = format(new Date(body?.stmtDate), 'yyyy-MM-dd');
  if (!stmtDate)
    return {
      ok: false,
      err: 'Invalid Statement Date',
    };

  return {
    ok: true,
    data: {
      userId: body.chqbookuserId,
      file: {
        data: file.buffer,
        type: 'csv',
      },
      stmtDate,
    },
  };
};

export const checkSubset = (parentArray, subsetArray) => {
  return subsetArray.every(el => {
    return parentArray.includes(el);
  });
};

import { IConfigApp } from '@config/constraint';

const config: IConfigApp = {
  port: 4000,
  logDir: '../logs',
  origin: '*',
  credentials: true,

  headers: {
    authorization: 'Authorization',
    appId: 'chqbook-App-Id',
  },
  cookies: {
    authorization: 'Authorization',
  },
  redisKeys: {
    fileTransactionsJob: 'fileTransactionsJob',
    uploadFileProcessJob: 'uploadFileProcessJob',
    fileAnalysisProcessJob: 'fileAnalysisProcessJob',
  },
  redisUrl: 'redis://localhost:6379',
  tableNames: {
    users: 'users',
    cities: 'cities',
    states: 'states',
  },
  appKey: '',
  adminLoggedIn: 0,
  UTMAppUrl: '',
  DigilockerAPIKey: '',
  PerfiosAPIKey: '',
  jobsApiKey: '',
  vaani: undefined,
  gupshupApiKey: '',
  faircentApiKey: '',
  permissionType: undefined,
  roleType: undefined,
};

export default config;

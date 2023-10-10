export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export interface IConfigApp {
  gender: any;
  bbps: any;
  UTMAppUrl: string;
  DigilockerAPIKey: string;
  PerfiosAPIKey: string;
  jobsApiKey: string;
  vaani: any;
  gupshupApiKey: string;
  faircentApiKey: string;
  permissionType: any;
  roleType: any;
  nodeEnv?: string;
  port: number;
  appKey: string;
  credentials: boolean;
  internalAccessToken?: string;
  databaseUrlSql?: string;
  databaseUrlMongo?: string;
  logDir: string;
  origin: string;
  adminLoggedIn: number;
  versionV2Time?: number;
  appMode?: number;
  dsModeProd?: number;
  dsModeUat?: number;
  headers: Headers;
  cookies: Cookies;
  redisUrl?: string;
  redisKeys: RedisKeys;
  tableNames: TableNames;
  appUrl?: string;
  base_url?: string;
}

interface managementPermissions {
  manageUsers: number;
}
interface mongoTypes {
  savePersonalDetails: string;
}
interface gender {
  genderMale: Number;
  genderFemale: Number;
  genderNa: Number;
  genderMaleText: String;
  genderFemaleText: String;
  genderOtherText: String;
}
interface Headers {
  authorization: string;
  appId: string;
}
interface Cookies {
  authorization: string;
}
interface AppIds {
  app: string;
  web: string;
}
interface TableNames {
  userProfileLinks: any;
  userProfiles: any;
  userPermissionLinks: any;
  modelHasRoles: any;
  modelHasPermissions: any;
  users: string;
  cities: string;
  states: string;
  instructions: string;
}
interface RedisKeys {
  fileTransactionsJob: string;
  uploadFileProcessJob: string;
  fileAnalysisProcessJob: string;
}

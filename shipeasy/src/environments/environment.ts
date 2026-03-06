// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  azureClientId: '#{AZURE_CLIENT_ID}#',
  redirectUri: '/registration',
  tenantId: '#{AZURE_TENANT_ID}#',
  AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'] || '',
  AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'] || '',
  AWS_REGION: 'ap-south-1',
  mapboxAccessToken: process.env['MAPBOX_ACCESS_TOKEN'] || '',
  cognito: {
    userPoolId: '#{COGNITO_USER_POOL_ID}#',
    userPoolWebClientId: '#{COGNITO_USER_POOL_WEB_CLIENT_ID}#',
  },
  isEncryption: false,
  token_name: 'id',
  baseUrl: '#{baseUrl}#',
  secretkey: '#{SECRET_KEY}#',
  baseUrlMaster: 'http://localhost:3000/api/',
  serviceName: 'shipeasy-web',
  environment: 'development',
  serverUrl: '#{APM_SERVER_URL}#',
  'x-api-key': '#{X_API_KEY}#',
  logoutURL: 'http://localhost:4200/login',
  bucketName: '#{S3_BUCKET_NAME}#',
  reportServerUrl: '#{REPORT_SERVER_URL}#',
  reportEditorUrl: '#{REPORT_EDITOR_URL}#',
  reportView: '#{REPORT_VIEW_URL}#',
  egmMsgversion: 'ICES1_5',
  egmMsgType: 'SACHI18',
  isQA: true,
  validate: {
    email: '^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$',
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phone: '^((\\+91-?)|0)?[0-9]{10}$',
    number: '^[0-9]*$',
    website: new RegExp(
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)+\.((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
    ),
    minDate: new Date().toISOString().split('T')[0]
  },
  firebase: {
    apiKey: '#{FIREBASE_API_KEY}#',
    authDomain: '#{FIREBASE_AUTH_DOMAIN}#',
    projectId: '#{FIREBASE_PROJECT_ID}#',
    storageBucket: '#{FIREBASE_STORAGE_BUCKET}#',
    messagingSenderId: '#{FIREBASE_MESSAGING_SENDER_ID}#',
    appId: '#{FIREBASE_APP_ID}#',
    measurementId: '#{FIREBASE_MEASUREMENT_ID}#'
  },

  socketUrl: 'http://localhost:3000',

  storageAccountName: '#{AZURE_STORAGE_ACCOUNT_NAME}#',
  storageAccountKey: process.env['AZURE_STORAGE_ACCOUNT_KEY'] || '',
  containerName: '#{AZURE_STORAGE_CONTAINER_NAME}#',
  igmMsgType: 'SACHI01',
  igmMsgversion: 'ICES1_5',
};

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  azureClientId: 'a4864937-0446-44ca-8120-a05d3a0a93c3',
  redirectUri: '/registration',
  tenantId : 'c057b376-3869-4d60-801a-b1d9a332dd97',
  // AWS_ACCESS_KEY_ID: "[REMOVED]",
  // AWS_SECRET_ACCESS_KEY: "[REMOVED]",
  AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'] || '',
  AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'] || '',
  AWS_REGION: "ap-south-1",
  mapboxAccessToken: process.env['MAPBOX_ACCESS_TOKEN'] || '',
  // baseUrl: 'http://diabos-api.centralus.azurecontainer.io:8290/contract/',
  cognito: {
    // userPoolId: 'ap-south-1_sMbdhMlON',

    // userPoolWebClientId: '1flct3t7rtuu31j5fuc7lgntb6'
    // userPoolId: 'ap-south-1_0UIwATTNq',
    // userPoolWebClientId: '3vt3d5bgtv5banqgaqqjshtra6',
    //QA
    userPoolId: 'ap-south-1_0UIwATTNq',
    userPoolWebClientId: '3vt3d5bgtv5banqgaqqjshtra6',
    //Dev
    // userPoolId: 'ap-south-1_y24kZq1xf',
    // userPoolWebClientId: '25gr5unhm6lc5afserb5i4b1rf'
  },
  // baseUrl: 'https://diabos-api.centralus.azurecontainer.io:8253/contract/',
  // baseUrlMaster: 'https://diabos-api.centralus.azurecontainer.io:8253/'
  isEncryption:false,
  //for dev purpose
  token_name: 'id',
  baseUrl: '#{baseUrl}#',
  // baseUrlMaster: 'http://diabos-api.centralus.azurecontainer.io:8290/',

  // for dev

  // baseUrl: 'http://diabos-api-qa.centralus.azurecontainer.io:8290/contract/',

  //baseUrlMaster: 'http://diabos-api-qa.centralus.azurecontainer.io:8290/',
  // for qa
  //  baseUrlMaster: 'http://diabos-api-qa.centralus.azurecontainer.io:8290/',
  // for qa https

  // baseUrlMaster: 'http://diabos-api-dev.centralus.azurecontainer.io:8290/',
  // baseUrlMaster:
  //  'https://api-dev.diabosapp.biz/api/',
  //  'https://qa-api.diabosapp.biz/',
  // 'https://api-qa.diabosapp.biz/api/',
  secretkey : process.env['ENCRYPTION_SECRET_KEY'] || '',
  // baseUrlMaster: 'https://api.shippeasy.com/api/',
//   baseUrlMaster: 'https://api-dev.shippeasy.com/api/',
  baseUrlMaster: 'http://localhost:3000/api/',
  // baseUrlMaster: 'https://shippeasy-api-dev.synoris.co/api/',
    // baseUrlMaster: 'https://jwx79tkz-3000.inc1.devtunnels.ms/api/',

  serviceName: 'shipeasy-web',
    environment:"development",
    serverUrl: 'https://apm.synoris.co',
  // baseUrlMaster: 'https://shipeasy-api-demo.azurewebsites.net/api/',

  // baseUrlMaster: 'https://8bhcmpcf-3000.inc1.devtunnels.ms/api/',
  'x-api-key' : process.env['X_API_KEY'] || '',
  logoutURL: "https://diabos-saweb.azurewebsites.net/login",
  //logoutURL: 'http://localhost:4200/login',
  bucketName:"diabos3.0-qa-image-bucket",
  username: process.env['REPORT_USERNAME'] || '',
  password: process.env['REPORT_PASSWORD'] || '',
  reportServerUrl:'https://bold-bi.diabosapp.biz/reporting/api/site/stdev',
  reportEditorUrl:'https://bold-bi.diabosapp.biz/reporting/reportservice/api/Designer',
  reportView:'https://bold-bi.diabosapp.biz/reporting/reportservice/api/Viewer',
  egmMsgversion:'ICES1_5',
  egmMsgType:'SACHI18',
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
    apiKey: "AIzaSyAW2dHz0SvjchyEHLeExTuFwAMn95tvhzE",
    authDomain: "diabos-fc49f.firebaseapp.com",
    projectId: "diabos-fc49f",
    storageBucket: "diabos-fc49f.appspot.com",
    messagingSenderId: "198648109724",
    appId: "1:198648109724:web:ad300def453336e5026b59",
    measurementId: "G-B1Q5PLSV9Q"
  },

  socketUrl:"https://shippeasy-api-dev.synoris.co",

storageAccountName : 'shipeasy',
storageAccountKey :  process.env['AZURE_STORAGE_ACCOUNT_KEY'] || '',
containerName: 'ship-docs',
igmMsgType:'SACHI01',
  igmMsgversion:'ICES1_5',

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */

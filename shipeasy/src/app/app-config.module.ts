import { NgModule, APP_INITIALIZER } from '@angular/core'; 
import { CognitoService } from './services/cognito.service';

export function init_app(cognito: CognitoService) {
  return () => { 
    if (!cognito.isInitialized) {
      cognito.isInitialized = true;
      return cognito.checklogin();
    }
    return Promise.resolve();
  };
}

@NgModule({
  providers: [
    CognitoService,
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [CognitoService],
      multi: true,
    },
  ],
})
export class AppConfigModule {}

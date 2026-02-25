import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
// Sentry.init({
//   dsn: "https://33964fef650c4b779a56b27848bb06ef@o4505437206413312.ingest.sentry.io/4505437216768000",
//   integrations: [
//     new Sentry.BrowserTracing({
//       // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
//       tracePropagationTargets: ["https://stolt-dev.azurewebsites.net/"],
//       routingInstrumentation: Sentry.routingInstrumentation,
//     }),
//     new Sentry.Replay(),
//   ],
//   // Performance Monitoring
//   tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
//   // Session Replay
//   replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
// });
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

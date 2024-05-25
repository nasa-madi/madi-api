import { logger } from './logger.js'
import { app } from './app.js'
import Router from 'koa-router';


console.log(process.env)

const port = app.get('port')
const host = app.get('host')


//***** SUPPLEMENTAL CODE FOR TESTING AUTH VIA WEB */
const router = new Router();

router.get('/oauth', (ctx) => {
  ctx.status = 302;
  ctx.set('set-cookie', 'GCP_IAP_XSRF_NONCE_ztD3hjeZ0kkeVkDW6C73UA=1; expires=Wed, 08-May-2024 03:06:48 GMT; path=/; Secure; HttpOnly');
  ctx.set('location', 'https://accounts.google.com/o/oauth2/v2/auth?client_id=351312167908-4gr0bivid2ucnmfa6usrsel4en5r2o78.apps.googleusercontent.com&response_type=code&scope=openid+email&redirect_uri=https://iap.googleapis.com/v1/oauth/clientIds/351312167908-4gr0bivid2ucnmfa6usrsel4en5r2o78.apps.googleusercontent.com:handleRedirect&code_challenge=d9Ffb08QLmkQQLZZ9IWYxzCjH4fWJ8khl1IgfLAmNuk&code_challenge_method=S256&cred_ref=true&state=AUNtcMAEtzdEGoFzeOaKqSBkg01AUCdf1BcsEMPR6HpWoh8UrQQ0miMzjjWapYui2YK933vouMsBIm_xccycbU6x1J25RuPudNxfZQhIn6QNN4CtVvcIxQZ8kOCz2BHRHmJmh2p9zOSM3Urnt8KScakNf_HBjJwIJFwJBjajWKiDrYTeqpGaMjgOSob08W7fLT0QJCWqVfhUZIK75TwPES07BobvXYnDEg_57rN2xBHMqxDZRsMsF4ac8arw-hqIWbffPs8zmDr7Gi6_JhuYQQ_oS-kLqx_JskLMycz9HjIBXHQ89v_-cnoATNxJmMzYztHEhTyOkaxOXgPP288DAkLGzRIDU394PY6YsY6mXEE7S9ysgluVc1iD4FOC6ZfAOdyYcXoAAB-SNVotxxwMr4gv6I17CHA24nOK-rmlPXfZ1s5sD6WLnZQHOd0DUEzLGjA7B6sX1qJHdWSBhkWLjoi_5ky_EuQ226lc34U1FTj4dDoMfZofVlkA8HSF850vtQ-caKhUmXnAsT8whSCcRX67D_G2SG3-8Q5hh5bhxDujkUrVykTaA5FaJ_XZwie1Vn05h0S37Zq69Mxz1e3tOpr_A2pyaG3khRscb93FD1Oei0VqTSeAtb2uhXnLOneUSQmD8dH91TGu5CSRFFuXiYlxIBErQe42U8v2fO3AhfIv01aweVg3QSvhV1NBfeeNMx-Uz58cRcBp8WXDx8w5OGRhJu7yQPfTriyogLampH5fJEtJvB62Sw1cP5fNQo1iIH8VBi98dmF50p9WFd3UHlk2uRkvd7rAUy4Q9xTNCAQvIMKGMIWV_htZrZp4Pdkk8in_-LzZKzTDCtVzmULtljBkkKTblGYzVBfriqeHIAHtSDBofOdfb1yCKFAbK-0Jra3Hl6ly8FIE_7gGWRdrUJR0QDd1Q0tIT4GWcEhS2GQW4scliw4Xk9aouyy5MV3IjyWxC0RDwoMGhJv7rZR6HnucpnAOMjKyMbd5vd8wFULdVVC9n3UTK29_RL9rY9nRKogORZPLEuz_UNh-lUbU-YgL');
  ctx.set('x-goog-iap-generated-response', 'true');
  ctx.set('date', 'Wed, 08 May 2024 02:56:48 GMT');
  ctx.set('content-type', 'text/html');
  ctx.set('server', 'Google Frontend');
  ctx.set('content-length', '36');
  ctx.set('via', '1.1 google');
  ctx.set('alt-svc', 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000');
  ctx.body = '';
});

app.use(router.routes());
app.use(router.allowedMethods());
//****** END SUPPLEMENTAL CODE */



process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason));
app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`);
});
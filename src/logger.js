import { createLogger, format, transports } from 'winston';

let loggingWinston;
if(process.env.GOOGLE_CLOUD_PROJECT){
  const { LoggingWinston } = await import('@google-cloud/logging-winston')
  loggingWinston = new LoggingWinston();
}

export const logger = createLogger({
  level: 'info',
  format: format.combine(format.json(), format.splat(), format.simple()),
  transports: [
    new transports.Console(),
    ...(loggingWinston ? [loggingWinston] : []),
  ],
});
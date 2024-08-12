import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

let loggingWinston;
if (process.env.GOOGLE_CLOUD_PROJECT) {
  const { LoggingWinston } = await import('@google-cloud/logging-winston');
  loggingWinston = new LoggingWinston();
}

// Define fixed widths for each log field
const TIMESTAMP_WIDTH = 0;
const LEVEL_WIDTH = 0;
const COMPONENT_WIDTH = 0;
const SUBCOMPONENT_WIDTH = 0;
const MESSAGE_WIDTH = 0;

// Custom log format function
const customLogFormat = printf(({ level, message, timestamp, component='', subcomponent='', full, ...metadata}) => {

  // Structure the metadata into key-value string format
  const metadataString = Object.entries(metadata)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  if(full){
    // Construct the log line
    return `${timestamp.padEnd(TIMESTAMP_WIDTH)} | ${level.padEnd(LEVEL_WIDTH)} | ${component.padEnd(COMPONENT_WIDTH)} | ${subcomponent.padEnd(SUBCOMPONENT_WIDTH)} | ${message.padEnd(MESSAGE_WIDTH)} | ${metadataString}`;
  }else{
    return (`${level}: `).padEnd(7) +message
  }

});

// Create the logger with the custom format
export const logger = createLogger({
  format: combine(
    timestamp(),
    colorize({ colors: { info: 'blue' , error: 'red', warn: 'yellow'}}),
  ),
  transports: [
    new transports.Console({
      format: combine(
        customLogFormat,
      ),
    }),
    ...(loggingWinston ? [loggingWinston] : []),
  ],
});


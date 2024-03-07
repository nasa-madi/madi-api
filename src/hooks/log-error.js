import { logger } from '../logger.js'

export const logError = async (context, next) => {
  try {
    await next()
  } catch (error) {
    logger.error(error.stack)
    // Log validation errors
    if (error.data) {
      logger.error('Data: %O', error.data)
    }

    if(error.cleanMessage){
      error.message = error.cleanMessage
      error.cleanMessage = undefined
    }
    throw error
  }
}


export const logErrorExternal = async (context, next) => {
    throw rewriteErrorMessage(context.error, context.path);
}

function rewriteErrorMessage(error, path) {
    // Define the match and message pairs
    let matchMessagePairs = [
        {
            match: 'duplicate key value violates unique constraint',
            message: `You cannot create a duplicate entity.`
        },
        // Add more pairs here as needed
    ];

    // Loop through each pair
    for (let pair of matchMessagePairs) {
        // Create a regular expression from the match string
        let regex = new RegExp(pair.match);

        // Test the error message against the regular expression
        if (regex.test(error.message)) {
            // If there's a match, replace the error message and exit the loop
            error.cleanMessage = pair.message;
            error.requestPath = `/${path}`
            break;
        }
    }
    return error
}

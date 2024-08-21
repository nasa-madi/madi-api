import { hooks } from '@feathersjs/schema'

// CUSTOM VALIDATOR TO ALLOW WARNINGS, NOT ERRORS
export const softValidator = (schema,options={}) => async (context, next) => {
    let verbose = options.verbose || false
    let logType = options.logType || 'warn'
    try {
      await hooks.validateData(schema)(context, next)
    }catch(error){
        if(verbose){
            console[logType]('*************\nVALIDATION WARNING: \n', error, '\nDATA: \n',JSON.stringify(context.data,null,2),'\nSCHEMA FEEDBACK: \n', JSON.stringify(error.data,null,2), '\n*************\n')
        }else{
            console[logType]('*************\nVALIDATION WARNING: \n', error, '\n*************\n')
        }
      
    }
}
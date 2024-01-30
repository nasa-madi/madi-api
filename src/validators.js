// For more information about this file see https://dove.feathersjs.com/guides/cli/validators.html
import { Ajv, addFormats } from '@feathersjs/schema'
import { TypeGuard } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'


function schemaOf(schemaOf, value, schema) {
  switch (schemaOf) {
    case 'Constructor':
      return TypeGuard.IsConstructor(schema) && Value.Check(schema, value) // not supported
    case 'Function':
      return TypeGuard.IsFunction(schema) && Value.Check(schema, value) // not supported
    case 'Date':
      return TypeGuard.IsDate(schema) && Value.Check(schema, value)
    case 'Promise':
      return TypeGuard.IsPromise(schema) && Value.Check(schema, value) // not supported
    case 'Uint8Array':
      return value instanceof Uint8Array
    case 'Undefined':
      return TypeGuard.IsUndefined(schema) && Value.Check(schema, value) // not supported
    case 'Void':
      return TypeGuard.IsVoid(schema) && Value.Check(schema, value)
    default:
      return false
  }
}

export function createAjv() {
  return addFormats(new Ajv({}), [
    'date-time', 
    'time', 
    'date', 
    'email',  
    'hostname', 
    'ipv4', 
    'ipv6', 
    'uri', 
    'uri-reference', 
    'uuid',
    'uri-template', 
    'json-pointer', 
    'relative-json-pointer', 
    'regex'
  ])
  .addKeyword({ type: 'object', keyword: 'instanceOf', validate: schemaOf })
  .addKeyword({ type: 'null', keyword: 'typeOf', validate: schemaOf })
  .addKeyword('exclusiveMinimumTimestamp')
  .addKeyword('exclusiveMaximumTimestamp')
  .addKeyword('minimumTimestamp')
  .addKeyword('maximumTimestamp')
  .addKeyword('minByteLength')
  .addKeyword('maxByteLength')
}


export const dataValidator = createAjv()


export const queryValidator = createAjv()
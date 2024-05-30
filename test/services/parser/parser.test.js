// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app.js'

describe('parser service', () => {
  it('registered the service', () => {
    const service = app.service('parser')

    assert.ok(service, 'Registered the service')
  })
})

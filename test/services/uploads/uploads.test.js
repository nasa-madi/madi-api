// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import { describe, it } from 'node:test'
import assert from 'assert'
import { app } from '../../../src/app.js'

describe('uploads service', () => {
  it('registered the service', () => {
    const service = app.service('uploads')

    assert.ok(service, 'Registered the service')
  })
})

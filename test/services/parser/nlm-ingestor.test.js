// curl -X POST "http://localhost:5001/api/parseDocument?renderFormat=all" \
//     -F file=@./tests/test_flattened_text.pdf \
// | jq 

// curl -X POST "http://localhost:5001/api/parseDocument?renderFormat=all&applyOcr=yes" \
//     -F file=@./tests/test_flattented_text.pdf \
// | jq 


// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import { describe, it } from 'node:test';
import { app } from '../../../src/app.js'
import { getOptions } from '../../../src/services/parser/parser.js'
import { strict as assert } from 'assert';
import { Readable } from 'stream';
// import { Response } from 'node-fetch'
import sinon from 'sinon';
import nock from 'nock'



describe('parser service', () => {
  it('registered the service', () => {
    const service = app.service('parser')
    assert.ok(service, 'Registered the service')
  })
})


describe('ParserService', () => {
  let parserService;
  let options = {
    path: 'http://localhost:5001/api/parseDocument',
    applyOcr: 'yes',
    renderFormat: 'all',
    splitter: {
      chunkSize: 10000,
      softMaxChunkSize: 3000
    }
  };
  parserService = app.service('parser')
  afterEach(() => {
    sinon.restore();
  })

  describe('create', () => {
    it('should return HTML format', async () => {
      const data = new Readable();
      data.push('test data');
      data.push(null);

      const params = { format: 'html' };

      sinon.stub(parserService, 'uploadFileToNLM').resolves({ return_dict: { result: { blocks: [] } } });
      sinon.stub(parserService, 'createHTMLfromNLM').returns('<html></html>');

      const result = await parserService.create(data, params);
      assert.equal(result, '<html></html>');

      parserService.uploadFileToNLM.restore();
      parserService.createHTMLfromNLM.restore();
    });

    it('should return markdown format', async () => {
      const data = new Readable();
      data.push('test data');
      data.push(null);

      const params = { format: 'markdown' };
      sinon.stub(parserService, 'uploadFileToNLM').resolves({ return_dict: { result: { blocks: [] } } });
      sinon.stub(parserService, 'createHTMLfromNLM').returns('<html><h1>html</h1></html>');

      const result = await parserService.create(data, params);
      assert.equal(result, '# html');

      parserService.uploadFileToNLM.restore();
      parserService.createHTMLfromNLM.restore();
    });

    it('should return chunks format', async () => {
      const data = new Readable();
      data.push('test data');
      data.push(null);

      const params = { format: 'chunks' };

      sinon.stub(parserService, 'uploadFileToNLM').resolves({ return_dict: { result: { blocks: [] } } });
      sinon.stub(parserService, 'createHTMLfromNLM').returns('<html><h1>html</h1><p>Hello there.  This is my test.</p></html>');

      const result = await parserService.create(data, params);
      assert(Array.isArray(result));

      parserService.uploadFileToNLM.restore();
      parserService.createHTMLfromNLM.restore();
    });
  });

  describe('uploadFileToNLM', () => {
    it('should upload file and return response data', async () => {
      const data = new Readable();
      data.push('test data');
      data.push(null);

      const mockResponse = {
        data: 'mockData',
      };
  
      nock('http://localhost:5001')
        .post('/api/parseDocument')
        .query({ renderFormat: 'all', applyOcr: 'yes' })
        .reply(200, mockResponse);
  
      const result = await parserService.uploadFileToNLM(data, options);
      assert.deepEqual(result, mockResponse);

    });
  });
  
  describe('curl requests', () => {
    it('should handle parseDocument without OCR', async () => {
      const mockResponse = {
        data: 'mockDataWithoutOCR',
      };
  
      nock('http://localhost:5001')
        .post('/api/parseDocument')
        .query({ renderFormat: 'all' })
        .reply(200, mockResponse);
  
      const result = await parserService.uploadFileToNLM('./tests/test_flattened_text.pdf', { renderFormat: 'all' });
      assert.deepEqual(result, mockResponse);
    });
  
    it('should handle parseDocument with OCR', async () => {
      const mockResponse = {
        data: 'mockDataWithOCR',
      };
  
      nock('http://localhost:5001')
        .post('/api/parseDocument')
        .query({ renderFormat: 'all', applyOcr: 'yes' })
        .reply(200, mockResponse);
  
      const result = await parserService.uploadFileToNLM('./tests/test_flattented_text.pdf', { renderFormat: 'all', applyOcr: 'yes' });
      assert.deepEqual(result, mockResponse);
    });
  });

  describe('createHTMLfromNLM', () => {
    it('should create HTML from NLM JSON', () => {
      const json = {
        return_dict: {
          result: {
            blocks: [
              { tag: 'header', block_class: 'header-class', sentences: ['Header'] },
              { tag: 'para', block_class: 'para-class', sentences: ['Paragraph'] }
            ]
          }
        }
      };

      const result = parserService.createHTMLfromNLM(json);
      assert.equal(result, '<h1 class="header-class">Header</h1>\n<p class="para-class">Paragraph</p>\n');
    });
  });
});

describe('getOptions', () => {
  it('should return options from app', () => {
    const app = {
      get: (key) => {
        if (key === 'parser') {
          return {
            nlm: {
              host: 'http://localhost:5001',
              applyOcr: 'yes',
              renderFormat: 'all',
              splitter: {
                chunkSize: 10000,
                softMaxChunkSize: 3000,
                delimiters: []
              }
            }
          };
        }
      }
    };

    const result = getOptions(app);
    assert.deepEqual(result, {
      app,
      path: 'http://localhost:5001/api/parseDocument',
      applyOcr: 'yes',
      renderFormat: 'all',
      splitter: {
        chunkSize: 10000,
        softMaxChunkSize: 3000,
        delimiters: []
      }
    });
  });
});

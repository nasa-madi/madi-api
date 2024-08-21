import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream'
import { logger } from '../../../logger.js';
import { BadRequest, GeneralError, Conflict } from '@feathersjs/errors';
import { disallow } from 'feathers-hooks-common'
import omit from 'lodash/omit.js'

import { getSharedBuffer, getFilePrefix } from './gcs.helpers.js'
import { getPathPrefix } from '../uploads.class.js';

export const gcsPath = 'gcs'
export const gcsMethods = ['find', 'get', 'create', 'remove']
export const logKey = 'UPLOADS_GCS'


export const gcs = (app) => {
  app.use(gcsPath, new GcsService(getOptions(app)), {
    methods: gcsMethods,
    events: []
  })
  app.service(gcsPath).hooks({
    before: {
      all: [
        disallow('external')
      ]
    }
  })
}



export class GcsService {
  constructor(options) {
    this.options = options;
  }



  //TODO: add force option to query

  async create(sourceMetadata, params) {


    // Get the buffer and original name from the file
    params.file.buffer = params?.file?.buffer || getSharedBuffer(sourceMetadata, params, this.options)
    params.file.filePrefix = params?.file?.filePrefix || getFilePrefix(sourceMetadata, params, this.options)
    params.file.pathPrefix = params?.file?.pathPrefix || getPathPrefix(sourceMetadata, params, this.options)
    
    params.file.fullPath = params.file.pathPrefix + params.file.filePrefix + "_" + params.file.originalname

    // Check for duplicates
    await this.checkForDuplicates(params.file.fullPath, params)

    // Create a readable stream from the buffer
    const stream = new Readable();
    stream.push(params?.file?.buffer);
    stream.push(null); // indicates end-of-file basically - the end of the stream
    
    // Create a file reference in the bucket
    let newFile = this.bucket.file(params?.file?.fullPath);

    return new Promise((resolve, reject) => {
      stream
        .pipe(newFile.createWriteStream())
        .on('finish', async () => {
          logger.info(`${logKey}: Write stream finished for ${params?.file?.originalname}`);

          try {
            const [systemMetadata] = await newFile.getMetadata();

            await newFile.setMetadata({ metadata: sourceMetadata });

            resolve(await this.cleanOutput(systemMetadata, sourceMetadata, params));
          } catch (error) {
            reject(new Error('Failure loading up to Google Cloud'));
          }
        })
        .on('error', reject);
    });
  }

  async checkForDuplicates(filePath, params) {
    const [files] = await this.bucket.getFiles({ prefix: filePath });
    // console.log(files)
    if(files.length > 0 && !this.options.allowDuplicates && !params.query?.force){
      throw new Conflict('File already exists',{
        filePath: params.file.fullPath
      })
    }
  }

  async cleanOutput(systemMetadata, sourceMetadata, params) {
    return {
      url: this.getPublicUrl(systemMetadata.name),
      signedUrl: params?.query?.sign ? await this.getSignedUrl(systemMetadata.name, params) : null,
      filePath: systemMetadata.name,
      metadata: {
        systemMetadata: {
          ...omit(systemMetadata, [
            'name','kind', 'id', 'selfLink', 'bucket', 'storageClass', 'timeStorageClassUpdated', 'md5Hash', 'mediaLink', 'crc32c', 'etag', 'plugin', 'userId']),
          pathPrefix: params?.file?.pathPrefix,
          filePrefix: params?.file?.filePrefix,
          originalName: params?.file?.originalname
        },
        sourceMetadata
      }
    }
  }

  getPublicUrl(fileName) {
    return this.bucket.file(fileName).publicUrl()
  }

  async getSignedUrl(fileName, params) {
    return this.bucket.file(fileName).getSignedUrl({
      expires: params?.query?.expires || this.options.expiration
    }).catch(e => {
      console.error(e)
      return null
    })
  }















  async get(fileName, params) {

    // if a file name has a %2 in its encoded
    if (fileName.includes('%2')) {
      fileName = decodeURIComponent(fileName)
    }
    
    // if a file has a / in it, it's a full path
    let slashCount = fileName.split('/').length - 1
    if (slashCount < 2) {
      throw BadRequest('Invalid file path. Must be in the format plugin/user/filename')
    }

    let [systemMetadata] = await this.bucket.file(fileName).getMetadata()

    return this.cleanOutput(systemMetadata, systemMetadata.metadata, params)
  }



  //maxResults	number	<optional>  Maximum number of items plus prefixes to return per call. Note: By default will handle pagination automatically if more than 1 page worth of results are requested per call. When autoPaginate is set to false the smaller of maxResults or 1 page of results will be returned per call.
// pageToken

  async find(params) {
    const search = params?.query?.search || '**'
    const limit = parseInt(params?.query?.$limit) || this.options.limit
    const skip = parseInt(params?.query?.$skip) || 0
    const prefix = getPathPrefix({}, params, this.options)
    const fileList = await this.bucket.getFiles(
      {
        prefix,
        autoPaginate: true,
        matchGlob: search,
        maxResults: limit,
        pageToken: skip
      }
    )
    const fileListData = await Promise.all(fileList[0].map(file => this.get(file.name, params)));

    return {
      limit,
      skip,
      total: fileListData.length,
      data: fileListData
    }
  }


  async remove(fileName, _params) {
    // if a file name has a %2 in its encoded
    if (fileName.includes('%2')) {
      fileName = decodeURIComponent(fileName)
    }

    // Remove a gcs from Google Cloud Storage
    const file = this.bucket.file(fileName);
    await file.delete();
    return { fileName, message: 'File deleted successfully.' };
  }

  async setup() {
    logger.info(`${logKey}: Setting up Google Cloud Storage with options: ${JSON.stringify(this.options.config)} and bucket: ${this.options.bucketName}`);
    this.storage = new Storage({
      ...this.options.config,
    });

    await this.storage
      .getBuckets()
      .then(buckets => {
        if (!buckets[0].map(b => b.name).includes(this.options.bucketName)) {
          this.storage.createBucket(this.options.bucketName)
        }
      }).catch(e => {
        logger.error(`${logKey}: Error creating bucket: ` + e)
      })

    this.bucket = await this.storage.bucket(this.options.bucketName);
  }
}


export const getOptions = (app) => {
  const {
    bucket,
    local = false,
    apiEndpoint,
    projectId,
    expiration = Date.now() + 1000 * 60 * 5, // 5 minutes
    allowDuplicates = false,
    useMetadataInHash = false,
    keyFilename
  } = app.get('storage').gcs;

  if (!bucket || !projectId || !apiEndpoint) {
    throw new GeneralError(`${logKey} Server is improperly configured. Please contact the administrator.`);
  }

  const config = local ? {
    apiEndpoint,
    projectId,
    keyFilename
  } : {};

  logger.info(`${logKey}: Bucket: ${bucket}`);
  logger.info(`${logKey}: Local: ${local}`);
  logger.info(`${logKey}: API Endpoint: ${apiEndpoint}`);
  logger.info(`${logKey}: Project ID: ${projectId}`);
  logger.info(`${logKey}: Default Expiration: ${expiration}`);
  logger.info(`${logKey}: Allow Duplicate Filenames: ${allowDuplicates}`);
  logger.info(`${logKey}: Use Metadata in Hash: ${useMetadataInHash}`);

  return {
    config,
    bucketName: bucket,
    app,
    expiration,
    allowDuplicates,
    useMetadataInHash
  };
};



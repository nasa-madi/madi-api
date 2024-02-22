import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream'
import { BadRequest } from '@feathersjs/errors'


export class BlobService {
  constructor(options) {
    this.options = options || {};
    const { bucket: bucketName, local, apiEndpoint, projectId } = this.options;
    if (!bucketName) {
      throw new Error('A bucket name must be specified in the options.');
    }

    // Determine if we should use the local GCS mock or actual Google Cloud Storage
    const storageConfig = local ? {
      apiEndpoint, // Local GCS mock server endpoint
      projectId, // projectId is required for Storage options even if it's a mock
      keyFilename: './src/auth/fake-credentials.json'
    } : {};

    this.storage = new Storage(storageConfig);
    this.storage
      .getBuckets()
      .then(async buckets => {
        if (!buckets[0].map(b => b.name).includes(bucketName)) {
          await this.storage.createBucket(bucketName)
          this.bucket = await this.storage.bucket(bucketName);
        }
      })

    this.bucket = this.storage.bucket(bucketName);
  }


  async get(fileName, params){

    let { restrictToUser, user, plugin, restrictToPlugin, sign } = params

    let userString = restrictToUser ? user.id : 'all'
    let pluginString = restrictToPlugin ? plugin.id : 'all'
    let prefix = `${pluginString}/${userString}/`

    // These options will allow temporary read access to the file
    const publicOptions = {
      destination: 'new.txt',
    };

    const signedOptions = {
      version: 'v4', // defaults to 'v2' if missing.
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60, // one hour
    };
    
    let url 
    if(sign === 'true'){
      url = await this.bucket.file(prefix+fileName).getSignedUrl(signedOptions);
      url = url[0]
    }else{
      url = await this.bucket.file(prefix+fileName).publicUrl(publicOptions);
    }
    return { url }
  }


  async find(params) {
    // Get a blob from Google Cloud Storage
    let { restrictToUser, user, plugin, restrictToPlugin } = params

    let userString = restrictToUser ? user.id : 'all'
    let pluginString = restrictToPlugin ? plugin.id : 'all'
    let prefix = `${pluginString}/${userString}/`
    let { search } = params.query

    const file = await this.bucket.getFiles(
      {
        prefix,
        matchGlob: search
      }
    );

    return file[0].map(f => {
      let base = f
      let meta = f.metadata
      let [plugin, user, name] = meta.name.split("/")
      return {
        name: meta.name,
        contentType: meta.contentType,
        createdAt: meta.timeCreated,
        updatedAt: meta.updated,
        size: meta.size,
        hash: meta.hash,
        metadata: meta.metadata
      }
    })
    // const [metadata] = await file.getMetadata();
    // return metadata;
  }

  async create(data, params) {
    return new Promise(async (resolve, reject) => {
      const { file, ...rest } = data
      const { buffer, mimetype, originalname } = file;

      let { restrictToUser, user, plugin, restrictToPlugin } = params
      let userString = restrictToUser ? user.id : 'all'
      let pluginString = restrictToPlugin ? plugin.id : 'all'
      let prefix = `${pluginString}/${userString}/`


      const stream = new Readable();
      stream.push(buffer);
      stream.push(null); // indicates end-of-file basically - the end of the stream
      stream.on('error', () => reject(new Error('Failure loading up to Google Cloud')));

      // this.bucket = await this.storage.getBuckets()

      const newFile = this.bucket.file(prefix + originalname);
      // const newFile = this.bucket.file(originalname);

      stream
        .pipe(newFile.createWriteStream())
        .on('error', async (e)=>{
          console.log('upload error')
          console.log(e)
          reject(new Error('Failure loading up to Google Cloud'))
          throw new BadRequest(e)
        })
        .on('finish', async () => {
          console.log('Write Stream Finished');

          let [meta,] = await newFile.getMetadata();

          let id = rest.id || meta.md5Hash

          await newFile.setMetadata({
            metadata: {
              ...rest,
              id: undefined
            },
          });

          resolve({
            id,
            name: meta.name,
            contentType: meta.contentType,
            createdAt: meta.timeCreated,
            updatedAt: meta.updated,
            size: meta.size,
            hash: meta.md5Hash,
            metadata: {
              ...rest,
              id: undefined,
              plugin: plugin?.id | undefined,
              userId: user?.id | undefined
            }
          });
        });
    });
  }




  async remove(fileName, _params) {
    // Remove a blob from Google Cloud Storage
    const file = this.bucket.file(fileName);
    await file.delete();
    return { fileName, message: 'File deleted successfully.' };
  }
}

export const getOptions = (app) => {
  // Get GCS bucket name from app configuration or environment variable
  const { bucket, local, apiEndpoint, projectId } = app.get('storage');
  return { bucket, local, apiEndpoint, projectId };
}
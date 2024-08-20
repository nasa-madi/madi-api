
import crypto from 'crypto';
import { BadRequest } from '@feathersjs/errors';

export function getFilePrefix(data, params, { allowDuplicates, useMetadataInHash }) {
    if(allowDuplicates){
        return new Date().getTime()
    }else{
        return getHash(data, params, {useMetadataInHash})
    }
}



export function getHash(data, params, {useMetadataInHash}) {
    // get hash of buffer
    let hash = crypto.createHash('sha256').update(params.file.buffer)
    if (useMetadataInHash) {
        hash = hash.update(JSON.stringify(data))
    }
    return hash.digest('hex');
}



export function getSharedBuffer(data, params, options) {

    if (!params?.file?.buffer) {
        throw new BadRequest('No file uploaded');
    }

    // Ensure params.file.buffer is a Buffer
    const buffer = params.file.buffer;

    // Create a SharedArrayBuffer and Uint8Array view from the Buffer
    const sharedBuffer = new SharedArrayBuffer(buffer.byteLength);
    const sharedView = new Uint8Array(sharedBuffer);
    sharedView.set(buffer);

    // Convert sharedView back to Buffer if needed
    const bufferFromSharedView = Buffer.from(sharedView);
    return bufferFromSharedView

}


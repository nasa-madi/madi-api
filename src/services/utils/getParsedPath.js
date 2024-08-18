export const getParsedPath = (data) => {
    if(typeof data === 'string'){
        data = data.split('/')
        let filename = data.pop()
        return data.join('/') + '/parsed/' + filename
    }
    if(typeof data === 'object'){
        return data.pathPrefix + 'parsed/' + data.filePrefix  +"_"+ data.originalName
    }
}

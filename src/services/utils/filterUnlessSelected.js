import { resolve, virtual } from '@feathersjs/schema'

export const filterUnlessSelected = (name) => virtual(async(chunk,context)=>{
    if(!context?.params?.query?.$select?.includes(name)){
      return undefined  // this hides the embedding from the end user
    }
    return chunk[name]
  })
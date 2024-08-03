import KoaMulter from '@koa/multer'
const multipartMulter = KoaMulter({ storage: KoaMulter.memoryStorage() }); // Use memory storage for file uploads


export const multer = (options) => {
    const field = typeof options === 'string' ? options : 'file';
    return async(ctx, next) => {
        await multipartMulter.single(field)(ctx, async()=>{
            ctx.feathers = ctx.feathers || {}; // Ensure ctx.feathers exists
            ctx.feathers.file = ctx.file;
            await next();
        })
    }
}

export default multer
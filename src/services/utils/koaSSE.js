import { PassThrough } from 'stream';


export async function streamToSSE(ctx){
    ctx.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    });
    ctx.status = 200;
    ctx.res.flushHeaders()
    let stream = ctx.body;
    ctx.body = new PassThrough();
    for await (let chunk of stream){
        ctx.body.write(`data: ${JSON.stringify(chunk)}\n\n`);
        if(chunk?.choices?.[0]?.finish_reason){
            ctx.body.write(`data: [DONE]\n\n`);
            ctx.body.end();
            return
        }
    }
}
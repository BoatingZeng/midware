/**
 * 返回一个错误处理中间件
 * @parma {object} [logger] - 传入一个logger以便记录日志
 * @return {async function} - (ctx, next)，标准的koa中间件
 */
var errorHandler = (logger) => async (ctx, next) => {
    try{
        await next();
    } catch(e) {
        if(logger) logger.error('errorHandler捕获：', e);
        ctx.response.status = e.status || e.statusCode || 500;
        switch (parseInt(ctx.response.status)) {
            case 500:
                ctx.response.body = {msg: '服务器的锅'};
                break;
        }
    }
}

module.exports = errorHandler;
/**
 * 返回一个404的处理中间件
 * @parma {object} [logger] - 传入一个logger以便记录日志
 * @return {async function} - (ctx, next)，标准的koa中间件
 */
var notFoundHandler = (logger) => async (ctx, next) => {
    await next();
    if(parseInt(ctx.response.status) === 404) {
        if(logger) logger.warn('404，找不到请求url：', ctx.request.url);
        ctx.response.body = {msg: '404 not fount'};
        ctx.response.status = 404;
    };
}

module.exports = notFoundHandler;
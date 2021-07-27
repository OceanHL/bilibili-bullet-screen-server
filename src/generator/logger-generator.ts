/*
 * @Author: jhl
 * @Date: 2021-07-08 17:13:54
 * @LastEditors: jhl
 * @LastEditTime: 2021-07-08 17:45:48
 * @Description:
 */
import { Context, Next } from 'koa';
function log(ctx: Context) {
    console.log(ctx.method, ctx.href, ctx.url);
}

export default function () {
    return async function (ctx: Context, next: Next) {
        log(ctx);
        await next();
    };
}

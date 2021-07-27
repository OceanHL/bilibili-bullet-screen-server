/*
 * @Author: jhl
 * @Date: 2021-07-13 16:49:41
 * @LastEditors: jhl
 * @LastEditTime: 2021-07-19 11:32:27
 * @Description:
 */
import { Context } from 'koa';
import router from '../router';
// import { BiliHttp } from '../util';

// const bilihttp = new BiliHttp();
// interface requestbodyType {
//     str_url: string;
// }

router.get('/comment', async (ctx: Context) => {
    // const { str_url } = ctx.request.body as unknown as requestbodyType;
    const str_url =
        'https://www.bilibili.com/video/BV1eU4y137dw?spm_id_from=333.851.b_7265636f6d6d656e64.1';
    if (!str_url) ctx.body = JSON.stringify({ code: -1, data: null });

    ctx.body = '评论信息';
});

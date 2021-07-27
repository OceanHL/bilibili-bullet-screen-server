/*
 * @Author: jhl
 * @Date: 2021-07-08 16:59:06
 * @LastEditors: jhl
 * @LastEditTime: 2021-07-10 10:56:13
 * @Description:
 */
import koa from 'koa';
import bodyparser from 'koa-bodyparser';
import koaStatic from 'koa-static';
import { resolve } from 'path';
import router from './router';
import loggerGenerator from './generator/logger-generator';
// 控制器
import './controller';
const app = new koa();

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = 'public';
// 解析资源类型
app.use(koaStatic(resolve(__dirname, staticPath)));
app.use(bodyparser());
app.use(loggerGenerator());

// 加载总的路由对象
app.use(router.routes()).use(router.allowedMethods());

app.listen(5000, () => {
    console.log(`服务启动在: http://localhost:5000`);
});

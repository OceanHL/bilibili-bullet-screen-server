/*
 * @Author: jhl
 * @Date: 2021-07-08 17:00:40
 * @LastEditors: jhl
 * @LastEditTime: 2021-07-13 20:40:20
 * @Description:
 */
import { Context } from 'koa';
import axios from 'axios';
import cheerio, { CheerioAPI } from 'cheerio';
import { BiliHttp, ResponseType, ResponseCode } from '../util';
import router from '../router';

// import superagent from 'superagent';

interface dataObj {
    cid: number;
    [key: string]: any;
}

type dataType = Array<dataObj>;

interface axiosDataType {
    code: number;
    message: string;
    ttl: number;
    data: dataType;
}

interface requestbodyType {
    str_url: string;
}

const biliHttp = new BiliHttp();

/**
 * @description 获取bvid号
 * @param {string} url
 * @return {*}  {string}
 */
function getBvid(url: string): string {
    const bvid = new URL(url).pathname.split('/')[2];
    console.log('bvid', bvid);
    return bvid;
}

/**
 * @description 获取cid号
 * @param {string} bvid
 * @return {*}  {Promise<number>}
 */
function getCid(bvid: string): Promise<number> {
    return new Promise(async __resolve => {
        try {
            const {
                data: { code, data },
            } = await axios.get<axiosDataType>(
                `https://api.bilibili.com/x/player/pagelist?bvid=${bvid}&jsonp=jsonp`
            );
            // 0代表响应成功
            if (code === ResponseCode.SUCCEED) __resolve(data[0].cid);
            // 其他值，如：-1，代表接口返回失败
            __resolve(ResponseCode.FAILURE);
        } catch (error) {
            // 响应失败，返回-1
            __resolve(ResponseCode.FAILURE);
        }
    });
}

/**
 * @description 处理xml文件
 * @param {string} xmlString
 * @return {*}  {CheerioAPI}
 */
function handleXML(xmlString: string): CheerioAPI {
    return cheerio.load(xmlString, {
        xml: {
            normalizeWhitespace: true,
            xmlMode: true,
        },
    });
}

/**
 * @description 统一处理返回的数据格式
 * @param {number} code
 * @param {*} data
 * @return {*}  {string}
 */
function handleAPIData(code: number, data: any): string {
    return JSON.stringify({ code, data });
}

router.post('/bulletscreen', async (ctx: Context) => {
    const { str_url } = ctx.request.body as unknown as requestbodyType;

    // 1. 从url中获取bvid
    const bvid = getBvid(str_url);

    // 2. 利用bvid获取cid
    const cid = await getCid(bvid);
    console.log('cid', cid);

    // 如果cid等于-1，说明请求失败
    if (cid === ResponseCode.FAILURE) return (ctx.body = 'cid获取失败');

    // 因为B站的弹幕返回的是xml格式，需要做一些特殊处理
    const { code, text: xmlString }: ResponseType = await biliHttp.getBulletScreen(
        `https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`
    );

    if (code === ResponseCode.FAILURE) return (ctx.body = '弹幕获取失败');

    // 处理获取到的xml文档
    const $ = handleXML(xmlString);

    const d = $('d').map((i, el) => {
        const text = $(el).text(); // 弹幕内容
        const ps = $(el).attr('p')?.split(','); // 获取弹幕在视频中的发射时间
        const time = ps ? +ps[0] : 0; // 弹幕在视频中的【发射时间】
        const date = new Date(ps ? +ps[4] * 1000 : 0).toUTCString(); // 【弹幕发布】的时间日期
        return {
            id: i, // 弹幕的序号
            date, // 【弹幕发布】的时间日期
            time, // 弹幕在视频中的【发射时间】
            text, // 弹幕内容
        };
    });

    const arr = Array.from(d);

    ctx.body = handleAPIData(ResponseCode.SUCCEED, arr);
    return;
});

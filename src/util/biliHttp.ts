/*
 * @Author: jhl
 * @Date: 2021-07-09 11:41:49
 * @LastEditors: jhl
 * @LastEditTime: 2021-07-13 21:43:09
 * @Description: 请求类
 */
import http from 'http';
import https from 'https';
import zlib from 'zlib';

enum protocolEnum {
    http = 'http',
    https = 'https',
    unKnow = 'unKnow', // 未知协议
}

enum compressMethodEnum {
    gzip = 'gzip', // gzip压缩算法
    deflate = 'deflate', // deflate压缩算法
    br = 'br', // brotli压缩算法
}

export enum ResponseCode {
    SUCCEED, // 0 代表响应成功
    FAILURE = -1, // -1 代表响应失败
}

export interface ResponseType {
    code: ResponseCode;
    text: string;
    headers?: any;
    rawHeaders?: any;
}

export interface ResponseError {
    mes: string;
}

class BiliHttp {
    /**
     * @description 发送http请求，只针对请求弹幕，因为返回的是xml文档
     * @private
     * @param {string} url
     * @return {*}  {Promise<ResponseType>}
     * @memberof BiliHttp
     */
    private async getHttp(url: string): Promise<ResponseType> {
        return new Promise<ResponseType>(__resolve => {
            http.get(url, res => {
                const datas: Array<Buffer> = [];
                res.on('data', (chunk: Buffer) => {
                    datas.push(chunk);
                });
                res.on('end', async () => {
                    const compress_method = res.headers['content-encoding'];
                    const dataBufer = Buffer.concat(datas);
                    const restext = await this.decompression(compress_method, dataBufer);
                    const response: ResponseType = {
                        code: ResponseCode.SUCCEED,
                        text: restext,
                        headers: res.headers,
                        rawHeaders: res.rawHeaders,
                    };
                    __resolve(response);
                });
                res.on('error', () => {
                    __resolve({
                        code: ResponseCode.FAILURE, // 响应失败
                        text: '请求失败',
                    });
                });
            });
        });
    }
    /**
     * @description 发送https请求，只针对请求弹幕，因为返回的是xml文档
     * @private
     * @param {string} url
     * @return {*}  {Promise<ResponseType>}
     * @memberof BiliHttp
     */
    async getHpttps(url: string): Promise<ResponseType> {
        return new Promise<ResponseType>(__resolve => {
            https.get(url, res => {
                const datas: Array<Buffer> = [];
                res.on('data', (chunk: Buffer) => {
                    datas.push(chunk);
                });
                res.on('end', async () => {
                    const compress_method = res.headers['content-encoding'];
                    const dataBufer = Buffer.concat(datas);
                    const resultText = await this.decompression(compress_method, dataBufer);
                    const response: ResponseType = {
                        code: ResponseCode.SUCCEED, //  响应成功
                        text: resultText, // 响应内容
                        headers: res.headers,
                        rawHeaders: res.rawHeaders,
                    };
                    __resolve(response);
                });
                res.on('error', () => {
                    __resolve({
                        code: ResponseCode.FAILURE, // 响应失败
                        text: '请求失败',
                    });
                });
            });
        });
    }
    /**
     * @description 响应内容的解压方法
     * @private
     * @param {(string | undefined)} compress_method
     * @param {Buffer} dataBufer
     * @return {*}  {Promise<string>}
     * @memberof BiliHttp
     */
    private async decompression(
        compress_method: string | undefined,
        dataBufer: Buffer
    ): Promise<string> {
        return new Promise((__resolve, __reject) => {
            switch (compress_method) {
                case compressMethodEnum.gzip:
                    // gzip解压方法
                    __resolve(zlib.gunzipSync(dataBufer).toString());
                    break;
                case compressMethodEnum.deflate:
                    // deflate解压算法
                    try {
                        __resolve(zlib.inflateSync(dataBufer).toString());
                    } catch (error) {
                        __resolve(zlib.inflateRawSync(dataBufer).toString());
                    }
                    break;
                case compressMethodEnum.br:
                    // br解压缩算
                    __resolve(zlib.brotliDecompressSync(dataBufer).toString());
                    break;
            }
        });
    }

    /**
     * @description 获取B站弹幕函数
     * @param {string} url
     * @return {*}  {(Promise<ResponseType | ResponseError>)}
     * @memberof BiliHttp
     */
    async getBulletScreen(url: string): Promise<ResponseType> {
        // 弹幕默认是get请求
        // https://www.bilibili.com/video/BV1gE411B7ks?spm_id_from=333.851.b_62696c695f7265706f72745f6d75736963.9
        const protocolName: string = url.split(':')[0].toLowerCase(); // 获取协议名

        if (protocolName === protocolEnum.https) return this.getHpttps(url);
        if (protocolName === protocolEnum.http) return this.getHttp(url);
        return {
            code: ResponseCode.FAILURE,
            text: '弹幕获取失败',
        };
    }

    async get_aid_byUrl() {
        return new Promise(_resolve => {});
    }
}

export default BiliHttp;

/*
 * @Author: jhl
 * @Date: 2021-07-13 17:06:44
 * @LastEditors: jhl
 * @LastEditTime: 2021-07-13 17:12:04
 * @Description:
 */
import * as ibili from 'ibili';

interface loadcommentsType {
    url: string;
}
declare module 'ibili' {
    export function loadcomments(ops: loadcommentsType): Promise<string> {}
}

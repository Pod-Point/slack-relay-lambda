import * as https from 'https';
import * as url from 'url';

export function postMessage(hookUrl: string, message: object) {
    return new Promise<string>((resolve, reject) => {
        const postData: string = JSON.stringify(message);
        const parsedUrl: url.Url = url.parse(hookUrl);

        const options: https.RequestOptions = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const postReq = https.request(options, res => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(`Error posting message to Slack API: ${res.statusCode} ${res.statusMessage}`);
            }
            let body: any[] = [];
            res.on('data', chunk => {
                return body.push(chunk);
            });
            res.on('end', () => {
                return resolve(Buffer.concat(body).toString());
            });
        });
        postReq.on('error', err => {
            reject(err);
        });
        postReq.write(postData);
        postReq.end();
    });
}

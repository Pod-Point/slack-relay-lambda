import https from 'https';
import url from 'url';

export const postMessage = (hookUrl, message) => new Promise((resolve, reject) => {
    const postData = JSON.stringify(message);
    const options = url.parse(hookUrl);
    options.method = 'POST';
    options.headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
    };

    const postReq = https.request(options, res => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(`Error posting message to Slack API: ${res.statusCode} ${res.statusMessage}`);
        }
        let body = [];
        res.on('data', chunk => {
            chunks.push(chunk);
        });
        res.on('end', () => {
            try {
                body = JSON.parse(Buffer.concat(chunks).toString());
            } catch(e) {
                reject(e);
            }
            resolve(body);
        });
    });
    postReq.on('error', err => {
        reject(err);
    });
    postReq.write(postData);
    postReq.end();
});

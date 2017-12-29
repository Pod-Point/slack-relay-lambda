import * as https from 'https';
import * as url from 'url';
import { SlackMessage } from '../interfaces/slack';
import { CloudwatchMessage, EventMessage } from '../interfaces/sns';

/**
 * Post a message to a Slack webhook url.
 *
 * @param {string} hookUrl
 * @param {SlackMessage} message
 * @returns {Promise<string>}
 */
export function postMessage(hookUrl: string, message: SlackMessage): Promise<string> {
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
            const body: any[] = [];
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

/**
 * Format a Cloudwatch SNS message for Slack.
 *
 * @param {CloudwatchMessage} message
 * @returns {SlackMessage}
 */
export function formatCloudwatchMessage(message: CloudwatchMessage): SlackMessage {
    const alarmName: string = message.AlarmName;
    const newState: string = message.NewStateValue;
    const reason: string = `<!channel> Check has entered the state ${newState}`;
    const timestamp: string = (new Date(message.StateChangeTime).getTime() / 1000).toFixed(0);

    let color: string = 'warning';
    let emoji: string = ':neutral_face:';
    switch (newState) {
        case 'OK':
            color = 'good';
            emoji = ':innocent:';
            break;
        case 'ALARM':
            color = 'danger';
            emoji = ':scream:';
            break;
    }

    return {
        channel: process.env.SLACK_CHANNEL,
        attachments: [
            {
                color,
                title: alarmName,
                title_link: 'https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#alarm:alarmFilter=inAlarm',
                fallback: `${alarmName} has entered the state ${newState}`,
                text: `${reason} ${emoji}`,
                ts: timestamp,
            },
        ],
    };
}

/**
 * Format an event message for Slack.
 *
 * @param {EventMessage} message
 * @returns {SlackMessage}
 */
export function formatEventMessage(message: EventMessage): SlackMessage {
    const timestamp: string = (new Date(message['Event Time']).getTime() / 1000).toFixed(0);

    return {
        channel: process.env.SLACK_CHANNEL,
        attachments: [
            {
                title: message['Source ID'],
                title_link: message['Identifier Link'],
                fallback: message['Event Message'],
                text: message['Event Message'],
                color: 'warning',
                ts: timestamp,
            },
        ],
    };
}

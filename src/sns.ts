import { Context, SNSEvent, Callback } from 'aws-lambda';
import { postMessage, formatCloudwatchMessage, formatEventMessage } from './lib/slack';
import { SlackMessage } from './interfaces/slack';

/**
 * Relay a SNS message to Slack.
 *
 * @param {SNSEvent} event
 * @param {Context} context
 * @param {Callback} callback
 */
export function handler(event: SNSEvent, context: Context, callback: Callback): void {
    let slackMessage: SlackMessage;
    const message: any = JSON.parse(event.Records[0].Sns.Message);

    if (message.hasOwnProperty('AlarmName')) {
        slackMessage = formatCloudwatchMessage(message);
    } else if (message.hasOwnProperty('Event Source')) {
        slackMessage = formatEventMessage(message);
    } else {
        console.log(event);
        callback('Unknown event type');
    }

    postMessage(process.env.HOOK_URL, slackMessage).then(message => {
        callback(null, message);
    }).catch(err => {
        callback(err);
    });
}

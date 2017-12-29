import { postMessage, formatCloudwatchMessage, formatEventMessage } from './lib/slack';
import { SlackMessage } from './interfaces/slack';

/**
 * Relay a SNS message to Slack.
 *
 * @param event
 * @param context
 */
export function handler(event: any, context: any): void {
    let slackMessage: SlackMessage;
    const message: any = JSON.parse(event.Records[0].Sns.Message);

    if (message.hasOwnProperty('AlarmName')) {
        slackMessage = formatCloudwatchMessage(message);
    } else if (message.hasOwnProperty('Event Source')) {
        slackMessage = formatEventMessage(message);
    }

    postMessage(process.env.HOOK_URL, slackMessage).then(() => {
        context.succeed();
    }).catch(err => {
        context.fail(err);
    });
}

import { postMessage } from './lib/slack';

export function handler(event, context) {
    const message = JSON.parse(event.Records[0].Sns.Message);

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

    const slackMessage = {
        channel: process.env.SLACK_CHANNEL,
        attachments: [
            {
                title: alarmName,
                title_link: 'https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#alarm:alarmFilter=inAlarm',
                fallback: `${alarmName} has entered the state ${newState}`,
                text: `${reason} ${emoji}`,
                color: color,
                ts: timestamp
            }
        ]
    };

    postMessage(process.env.HOOK_URL, slackMessage).then(() => {
        context.succeed();
    }).catch(err => {
        context.fail(err);
    });
}

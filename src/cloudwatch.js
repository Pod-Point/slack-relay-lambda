import { decryptString } from './lib/kms';
import { postMessage } from './lib/slack';

var hookUrl, kmsEncyptedHookUrl, slackChannel;

kmsEncyptedHookUrl = 'CiAdYuHo9YVqpH25XjTQyq/8ep7ixdreArIHRWGFYjvEyxLQAQEBAgB4HWLh6PWFaqR9uV400Mqv/Hqe4sXa3gKyB0VhhWI7xMsAAACnMIGkBgkqhkiG9w0BBwaggZYwgZMCAQAwgY0GCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMjElsa6tOuFEkqSUEAgEQgGAekpqlRkvFfckMHChJ2b6PJXt0wqH8xTI7C5txgDwSp6pCeyN2LxZdaoruDZP+bImlwHG5pH1xrIHHBReX0XYtB3KDkMOtNAjWAGziiYr15LdzwwSNvPZn5m26p81oAvU=';  // Enter the base-64 encoded, encrypted key (CiphertextBlob)
slackChannel = '#software-devs-team';

var processEvent = (event, context) => {
    const message = JSON.parse(event.Records[0].Sns.Message);

    const alarmName = message.AlarmName;
    const newState = message.NewStateValue;
    const reason = `<!channel> Check has entered the state ${newState}`;
    const timestamp = (new Date(message.StateChangeTime).getTime() / 1000).toFixed(0);

    let color = 'warning';
    let emoji = ':neutral_face:';
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
        channel: slackChannel,
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

    postMessage(hookUrl, slackMessage).then(() => {
        context.succeed();
    }).catch(err => {
        context.fail(err);
    });
};


exports.handler = (event, context) => {
    if (hookUrl) {
        return processEvent(event, context);
    }

    decryptString(kmsEncyptedHookUrl).then(decryptedString => {
        hookUrl = `https://${decryptedString}`;

        return processEvent(event, context);
    }).catch(err => {
        context.fail(err);
    })
};

var AWS = require('aws-sdk');
var url = require('url');
var https = require('https');
var hookUrl, kmsEncyptedHookUrl, slackChannel;

kmsEncyptedHookUrl = 'CiAdYuHo9YVqpH25XjTQyq/8ep7ixdreArIHRWGFYjvEyxLQAQEBAgB4HWLh6PWFaqR9uV400Mqv/Hqe4sXa3gKyB0VhhWI7xMsAAACnMIGkBgkqhkiG9w0BBwaggZYwgZMCAQAwgY0GCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMjElsa6tOuFEkqSUEAgEQgGAekpqlRkvFfckMHChJ2b6PJXt0wqH8xTI7C5txgDwSp6pCeyN2LxZdaoruDZP+bImlwHG5pH1xrIHHBReX0XYtB3KDkMOtNAjWAGziiYr15LdzwwSNvPZn5m26p81oAvU=';  // Enter the base-64 encoded, encrypted key (CiphertextBlob)
slackChannel = '#software-devs-team';

var postMessage = function(message, callback) {
    var body = JSON.stringify(message);
    var options = url.parse(hookUrl);
    options.method = 'POST';
    options.headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
    };

    var postReq = https.request(options, function(res) {
        var chunks = [];
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            return chunks.push(chunk);
        });
        res.on('end', function() {
            var body = chunks.join('');
            if (callback) {
                callback({
                    body: body,
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage
                });
            }
        });
        return res;
    });

    postReq.write(body);
    postReq.end();
};

var processEvent = function(event, context) {
    var message = JSON.parse(event.Records[0].Sns.Message);

    var alarmName = message.AlarmName;
    var oldState = message.OldStateValue;
    var newState = message.NewStateValue;
    var reason = '<!channel> Check has entered the state ' + newState;
    var timestamp = (new Date(message.StateChangeTime).getTime() / 1000).toFixed(0);

    var color = 'warning';
    var emoji = ':neutral_face:';
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

    console.info(message);

    var slackMessage = {
        channel: slackChannel,
        attachments: [
            {
                title: alarmName,
                title_link: 'https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#alarm:alarmFilter=inAlarm',
                fallback: alarmName + ' has entered the state ' + newState,
                text: reason + ' ' + emoji,
                color: color,
                ts: timestamp
            }
        ]
    };

    postMessage(slackMessage, function(response) {

        if (response.statusCode < 400) {
            console.info('Message posted successfully');
            context.succeed();
        } else if (response.statusCode < 500) {
            console.error("Error posting message to Slack API: " + response.statusCode + " - " + response.statusMessage);
            context.succeed();  // Don't retry because the error is due to a problem with the request
        } else {
            // Let Lambda retry
            context.fail("Server error when processing message: " + response.statusCode + " - " + response.statusMessage);
        }
    });
};


exports.handler = function(event, context) {
    if (hookUrl) {
        // Container reuse, simply process the event with the key in memory
        processEvent(event, context);
    } else if (kmsEncyptedHookUrl && kmsEncyptedHookUrl !== '<kmsEncryptedHookUrl>') {
        var encryptedBuf = new Buffer(kmsEncyptedHookUrl, 'base64');
        var cipherText = { CiphertextBlob: encryptedBuf };

        var kms = new AWS.KMS();
        kms.decrypt(cipherText, function(err, data) {
            if (err) {
                console.log("Decrypt error: " + err);
                context.fail(err);
            } else {
                hookUrl = "https://" + data.Plaintext.toString('ascii');
                processEvent(event, context);
            }
        });
    } else {
        context.fail('Hook URL has not been set.');
    }
};

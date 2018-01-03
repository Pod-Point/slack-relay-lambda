# slack-relay-lambda

[![Build Status](https://travis-ci.com/Pod-Point/slack-relay-lambda.svg?token=F7wj2GWZpNRsZSDUXLya&branch=serverless)](https://travis-ci.com/Pod-Point/slack-relay-lambda) [![codecov](https://codecov.io/gh/Pod-Point/slack-relay-lambda/branch/master/graph/badge.svg?token=ssI847pEqw)](https://codecov.io/gh/Pod-Point/slack-relay-lambda)

Lambda script written in TypeScript that relay AWS SNS notifications to Slack.

### Lambda functions

* `sns` - Relays SNS notifications to Slack.

### Config

Edit your `.env.yml` and be sure to set both `HOOK_URL` and `SLACK_CHANNEL` to your slack
[Incoming WebHook](https://my.slack.com/apps/A0F7XDUAZ-incoming-webhooks) details.

### Setup

Create a new SNS Topic and then add a Subscription to the new `slack-relay-production-sns` Lambda function.

You can then set up this SNS Topic as a target for Cloudwatch Alarms.

##### Health events

Optionally you can also create a Cloudwatch
[Event rule](https://docs.aws.amazon.com/health/latest/ug/cloudwatch-events-health.html) to forward Health API
events to the SNS topic.

##### RDS events

You can also set up [RDS Events](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.html) to
forward events to the topic.

### Deploy
This function can be deployed with Serverless.

* `npm run deploy`

### Testing
Run the test suite with:
* `npm test`

Or manually invoke functions locally with:
* `serverless invoke local --function sns -p __tests__/data/event.json`

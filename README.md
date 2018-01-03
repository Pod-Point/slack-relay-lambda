# slack-relay-lambda

Lambda scripts that relay alerts to Slack

### Deploy
* `npm run deploy`

### Testing
Run the test stuite with:
* `npm test`

Or invoke functions locally with:
* `serverless invoke local --function sns -p __tests__/data/event.json`

### SNS
This function is subscribed to by two SNS topics:

* [software-slack](https://eu-west-1.console.aws.amazon.com/sns/v2/home?region=eu-west-1#/topics/arn:aws:sns:eu-west-1:959744386191:software-slack)
* [software-slack-us](https://console.aws.amazon.com/sns/v2/home?region=us-east-1#/topics/arn:aws:sns:us-east-1:959744386191:software-slack-us)

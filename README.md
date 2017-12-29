# slack-relay-lambda

Lambda scripts that relay alerts to Slack

### Deploy
* `serverless deploy --stage production`

### Testing
* `serverless invoke local --function sns -p test/event.json`

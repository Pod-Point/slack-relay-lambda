# slack-relay-lambda

Lambda scripts that relay alerts to Slack

### Deploy
* `npm run deploy`

### Testing
Run the test stuite with:
* `npm test`

Or invoke functions locally with:
* `serverless invoke local --function sns -p __tests__/data/event.json`

import * as https from 'https';
import { Context } from 'aws-lambda';
import { handler } from '../sns';

const data = require('./data/cloudwatch.json');

jest.mock('https');

describe('slack relay test', () => {
    afterEach(() => {
        delete process.env.HOOK_URL;
    });

    it('relays a cloudwatch event', () => {
        const contextMock = jest.fn<Context>();
        process.env.HOOK_URL = 'http://slack.com/test';

        handler(data, new contextMock(), () => {
            expect(https.request).toHaveBeenCalled();
        });
    });
});

import * as https from 'https';
import { handler } from '../sns';
import * as cloudwatch from '../../test/cloudwatch.json';

jest.mock('https');

describe('slack relay test', () => {
    afterEach(() => {
        delete process.env.HOOK_URL;
    });

    it('relays a cloudwatch event', () => {
        const contextMock = jest.fn();
        process.env.HOOK_URL = 'http://slack.com/test';

        handler(cloudwatch, contextMock, () => {
            expect(https.request).toHaveBeenCalled();
        });
    });
});

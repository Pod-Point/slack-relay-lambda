import * as AWS from 'aws-sdk';

export function decryptString(encyptedString){
    return new Promise<string>((resolve, reject) => {
        const encryptedBuf: Buffer = new Buffer(encyptedString, 'base64');
        const cipherText: AWS.KMS.Types.DecryptRequest = {
            CiphertextBlob: encryptedBuf
        };
        const kms: AWS.KMS = new AWS.KMS();

        kms.decrypt(cipherText, (err, data) => {
            if (err) {
                return reject(err);
            }

            resolve(data.Plaintext.toString());
        });
    });
}

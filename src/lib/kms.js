import AWS from 'aws-sdk';

export const decryptString = kmsEncyptedString => new Promise((resolve, reject) => {
    const encryptedBuf = new Buffer(kmsEncyptedString, 'base64');
    const cipherText = { CiphertextBlob: encryptedBuf };
    const kms = new AWS.KMS();

    kms.decrypt(cipherText, (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data.Plaintext.toString('ascii'));
        }
    });
});

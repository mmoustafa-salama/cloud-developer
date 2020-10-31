import * as AWS from "aws-sdk";

export class AttachementDataAccess {
    constructor(
        private readonly s3 = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.TODO_ATTACHEMENTS_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
    }

    getUploadUrl(todoId: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
        })
    }

    buildAttachementUrl(todoId: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;
    }
}
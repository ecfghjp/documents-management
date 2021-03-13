import * as sdk from 'aws-sdk'
import S3 from 'aws-sdk/clients/s3'

const topicarn = process.env.TOPIC_ARN;
const bucketName = process.env.DOCUMENT_BUCKET_NAME;
const s3 = new S3();
exports.handler = async (event: { Records: { Sns: { Message: any; }; }[]; }, context: any, callback: (arg0: null, arg1: string) => void) =>{
    console.log('Event received from SNS:', JSON.stringify(event));
    var message = JSON.parse(event.Records[0].Sns.Message);
    var s3Message = message.Records[0].s3.object;
    const document = await generateSignedURL(s3Message);
    console.log('Signed URL to be emailed:', JSON.stringify(document));
    callback(null, "Success");
}

const generateSignedURL  = async (object: S3.Object): Promise<{filename:string, url: string}> =>{

    const url = await s3.getSignedUrlPromise('getObject',{
        Bucket: bucketName,
        Key: object.key,
        Expires: (60*60)
    });
    console.log('URL is  ',url, ' and key is '+object.key);

    return{
        filename: object.key,
        url: url
    }
}
    
import * as sdk from 'aws-sdk'
import S3 from 'aws-sdk/clients/s3'


const topicarn = process.env.TOPIC_ARN;
const bucketName = process.env.DOCUMENT_BUCKET_NAME;
const s3 = new S3();
exports.handler = async () =>{
    
        const {Contents: results} = await s3.listObjects({Bucket: bucketName!}).promise();
        const documents = await Promise.all(results!.map(async r =>generateSignedURL(r)));
        var params = {
            Message: JSON.stringify(documents), /* required */
            TopicArn: topicarn
          };
          console.log(`sending to the SNS now ${params}`);
          
        var publishTextPromise = new sdk.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
    function(data) {
        console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
    }).catch(
        function(err) {
        console.error(err, err.stack);
    });
    
}

const generateSignedURL  = async (object: S3.Object): Promise<{filename:string, url: string}> =>{
    const url = await s3.getSignedUrlPromise('getObject',{
        Bucket: bucketName,
        Key: object.Key,
        Expires: (60*60)
    });
    return{
        filename: object.Key!,
        url: url
    }
}
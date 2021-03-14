import * as sdk from 'aws-sdk'
import S3 from 'aws-sdk/clients/s3'
import { Session } from 'inspector';

const bucketName = process.env.DOCUMENT_BUCKET_NAME;
const senderEmail = process.env.SENDER_EMAIL;
const recieverEmail = process.env.RECIEVER_EMAIL;
const s3 = new S3();
exports.handler = async (event: { Records: { Sns: { Message: any; }; }[]; }, context: any, callback: (arg0: null, arg1: string) => void) =>{
    console.log('Event received from SNS:', JSON.stringify(event));
    var message = JSON.parse(event.Records[0].Sns.Message);
    var s3Message = message.Records[0].s3.object;
    const document = await generateSignedURL(s3Message);
    console.log('Signed URL to be emailed:', JSON.stringify(document));
    
    //send email via SES
    const textBody = JSON.stringify(document);

  // Create sendEmail params
  const params = {
    Destination: {
      ToAddresses: [recieverEmail]
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: textBody
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Review: New document uploaded"
      }
    },
    Source: senderEmail
  };
  
  // Create the promise and SES service object
  const sendPromise = new sdk.SES({ apiVersion: "2010-12-01" })
    .sendEmail(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(data => {
      console.log(data.MessageId);
      context.done(null, "Success");
    })
    .catch(err => {
      console.error(err, err.stack);
      context.done(null, "Failed");
    });
    callback(null, "Success");
};

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
    
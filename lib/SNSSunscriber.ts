import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import * as lambda from '@aws-cdk/aws-lambda-nodejs'
import * as iam from '@aws-cdk/aws-iam'
import * as path from 'path'
import { Runtime } from '@aws-cdk/aws-lambda';
import { ITopic, Topic, Subscription } from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as s3n from '@aws-cdk/aws-s3-notifications';
import * as ses from '@aws-cdk/aws-ses'
import { Effect } from '@aws-cdk/aws-iam';
import * as AWS from 'aws-sdk'





interface SNSSubscriberProps{

    bucket: s3.Bucket
    topic: ITopic
  
}

export class SNSSubscriber extends cdk.Construct{
    constructor(scope: cdk.Construct, id: string, props: SNSSubscriberProps) {
        super(scope, id);
        const subscriptionFunction = new lambda.NodejsFunction(this,'SubscriberSNSTopic',{
            runtime: Runtime.NODEJS_12_X,
            entry: path.join(__dirname,'..','api','get-documents','sns_subscriber.ts'),
            handler: 'handler',
            environment:{
                DOCUMENT_BUCKET_NAME: props.bucket.bucketName,
                TOPIC_ARN: props.topic.topicArn
            }
        });
        props.topic.addSubscription(new subscriptions.LambdaSubscription(subscriptionFunction));
        
            //grant the list and get objects rights to lambda to S3
            props.bucket.addEventNotification(
                s3.EventType.OBJECT_CREATED,
                new s3n.SnsDestination(props.topic)
              );
          
              props.bucket.addEventNotification(
                s3.EventType.OBJECT_REMOVED,
                new s3n.SnsDestination(props.topic)
              );
      //permissions required if the file will be opened via lambda
      const bucketContainerPermissions = new iam.PolicyStatement();
      bucketContainerPermissions.addResources(props.bucket.bucketArn);
      bucketContainerPermissions.addActions('s3:ListBucket');
      subscriptionFunction.addToRolePolicy(bucketContainerPermissions);

      const bucketPermissions = new iam.PolicyStatement();
      bucketPermissions.addResources(`${props.bucket.bucketArn}/*`);
      bucketPermissions.addActions('s3:GetObject','s3:PutObject');
      subscriptionFunction.addToRolePolicy(bucketPermissions);

      //verify SES sender
      const ses = new AWS.SES();
      var params = {
        EmailAddress: "abhisheksharmacs@gmail.com"
       };
      ses.verifyEmailIdentity(params,function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);
      });
      //permissions to send email from ses
      const emailPermissions = new iam.PolicyStatement();
      emailPermissions.addResources('*');
      emailPermissions.addActions('ses:SendEmail', 'SES:SendRawEmail');
      subscriptionFunction.addToRolePolicy(emailPermissions);
    }

    
}
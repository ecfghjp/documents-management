import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import * as lambda from '@aws-cdk/aws-lambda-nodejs'
import * as iam from '@aws-cdk/aws-iam'
import * as path from 'path'
import { S3EventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Runtime } from '@aws-cdk/aws-lambda';
import { ITopic, Topic } from '@aws-cdk/aws-sns';

interface SNSPublisherProps{
  bucket: s3.Bucket
  topic: ITopic
}

export class SNSPublisher extends cdk.Construct{
    constructor(scope: cdk.Construct, id: string, props: SNSPublisherProps) {
        super(scope, id);
const getDocumentsFunction = new lambda.NodejsFunction(this,'GenerateSNSNotificationFunction',{
    runtime: Runtime.NODEJS_12_X,
    entry: path.join(__dirname,'..','api','get-documents','sns_publisher.ts'),
    handler: 'handler',
    environment:{
      DOCUMENT_BUCKET_NAME: props.bucket.bucketName,
      TOPIC_ARN: props.topic.topicArn
  }
});
//arant publish rights to lambda function
props.topic.grantPublish(getDocumentsFunction);


getDocumentsFunction.addEventSource(new S3EventSource(props.bucket, {
    events: [ s3.EventType.OBJECT_CREATED, s3.EventType.OBJECT_REMOVED ]}));
    //grant the list and get objects rights to lambda to S3

    const bucketContainerPermissions = new iam.PolicyStatement();
      bucketContainerPermissions.addResources(props.bucket.bucketArn);
      bucketContainerPermissions.addActions('s3:ListBucket');
      getDocumentsFunction.addToRolePolicy(bucketContainerPermissions);

      const bucketPermissions = new iam.PolicyStatement();
      bucketPermissions.addResources(`${props.bucket.bucketArn}/*`);
      bucketPermissions.addActions('s3:GetObject','s3:PutObject');
      getDocumentsFunction.addToRolePolicy(bucketPermissions);

}


}
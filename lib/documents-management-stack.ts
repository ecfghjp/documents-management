import * as cdk from '@aws-cdk/core';
import {Bucket, BucketEncryption} from '@aws-cdk/aws-s3'
import { Networking } from './Networking'
import { Webserver } from './webserver'
import { SQSQueue } from './sqs-queue'
import { SnsTopic } from './sns-topic'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3n from '@aws-cdk/aws-s3-notifications';

import { Tags } from '@aws-cdk/core';
import {DocumentManagementApi} from './api'
import * as s3deployment from '@aws-cdk/aws-s3-deployment'
import * as path from 'path'
import { Vpc } from '@aws-cdk/aws-ec2';

interface DocumentManagementProps{

}

export class DocumentsManagementStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucket = new Bucket(this, 'DocumentsBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      bucketName: "ecfghjp-documents-bucket",
      versioned: true
  });

    // The code that defines your stack goes here
    new cdk.CfnOutput(this,"DocumentsBucketNameExporter",{
      value: bucket.bucketName,
      exportName: "DcumentsBucketname"
    });

    const networking = new Networking(this,'NetworkingConstruct',{
      maxAZs : 2
    })

    new s3deployment.BucketDeployment(this,'DocumentsDeployment',{
      sources:[
        s3deployment.Source.asset(path.join(__dirname,'..','documents'))
      ],
      destinationBucket:bucket,
      memoryLimit: 512
    });


    Tags.of(networking).add("Module","Networking");

    const api = new DocumentManagementApi(this,'DocumentManagementApi',{
      documentsBucket: bucket
    });
    Tags.of(api).add("Module","API");

    const webServerEcs = new Webserver(this,'WebServerECS',{
      vpc: networking.vpc,
      api: api.httpApi

    })

    Tags.of(webServerEcs).add("Module","Webserver");

    const sqsQueue = new SQSQueue(this,'DocumentsQueue',{
      queueName: 'DocumentsQueue'
    });
    Tags.of(webServerEcs).add("Module","Queue");
    //create a subscription and assign it to the queue
    
    //create a topic and add to queue Q: when will the emails be sent
    const topic = new SnsTopic(this,'DocumentsTopic',{
      topicName: 'DocumentsTopic',
      subscriberEmail:'abhisheksharmacs@gmail.com'
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(topic.topic)
    );

    bucket.addEventNotification(
      s3.EventType.OBJECT_REMOVED,
      new s3n.SnsDestination(topic.topic)
    );


  }
}

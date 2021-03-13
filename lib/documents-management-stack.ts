import * as cdk from '@aws-cdk/core';
import {Bucket, BucketEncryption} from '@aws-cdk/aws-s3'
import { Networking } from './Networking'
import { Webserver } from './webserver'
import { SQSQueue } from './sqs-queue'
import { SnsTopic } from './sns-topic'
import { SNSPublisher } from './SNSPublisher'
import { Tags } from '@aws-cdk/core';
import {DocumentManagementApi} from './api'
import * as s3deployment from '@aws-cdk/aws-s3-deployment'
import * as path from 'path'

import * as s3 from '@aws-cdk/aws-s3'
import { SNSSubscriber } from './SNSSunscriber';




interface DocumentManagementProps{

}

export class DocumentsManagementStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //create a bucket with properties
    const bucket = new Bucket(this, 'DocumentsBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      bucketName: "ecfghjp-documents-bucket",
      versioned: true
  });

    //cloud formation output ?? why is it used??
    new cdk.CfnOutput(this,"DocumentsBucketNameExporter",{
      value: bucket.bucketName,
      exportName: "DcumentsBucketname"
    });

    //define networking component
    const networking = new Networking(this,'NetworkingConstruct',{
      maxAZs : 2
    })

    //this code is for s3 deploymnet and gets invoked is there is any document in the described folder
    new s3deployment.BucketDeployment(this,'DocumentsDeployment',{
      sources:[
        s3deployment.Source.asset(path.join(__dirname,'..','documents'))
      ],
      destinationBucket:bucket,
      memoryLimit: 512
    });

    //always use Tags
    Tags.of(networking).add("Module","Networking");

    //defines api for api gateway and passes in bucket as a parameter 
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
    //create an SNS topic
    const topic = new SnsTopic(this,'DocumentsTopic',{
      topicName: 'DocumentsTopic',
      subscriberEmail:'abhisheksharmacs@gmail.com'
    });

    //lambda function call to the topic
    //const snsPublisher = new SNSPublisher(this,'SNSPublisher',{
    //  bucket: bucket,
    //  topic: topic.topic
    //});

    const snsSubscriber = new SNSSubscriber(this,'SNSSubscriber',{
      bucket: bucket,
      topic: topic.topic
    });

    
    

  }
}

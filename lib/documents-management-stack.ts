import * as cdk from '@aws-cdk/core';
import {Bucket, BucketEncryption} from '@aws-cdk/aws-s3'
import { Networking } from './Networking'
import { Tags } from '@aws-cdk/core';
import {DocumentManagementApi} from './api'
import * as s3deployment from '@aws-cdk/aws-s3-deployment'
import * as path from 'path'

export class DocumentsManagementStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucket = new Bucket(this, 'DocumentsBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      bucketName: "ecfghjp-documents-bucket"
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

  }
}

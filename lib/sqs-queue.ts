import * as sqs from '@aws-cdk/aws-sqs'
import * as cdk from '@aws-cdk/core'
import { QueueEncryption } from '@aws-cdk/aws-sqs';

interface SQSQueueProps{
    queueName: string
}

export class SQSQueue extends cdk.Construct{
    constructor(scope: cdk.Construct, id: string, props: SQSQueueProps) {
        super(scope, id);
        new sqs.Queue(this, 'DocumentsQueue', {
            queueName: props.queueName,
            encryption: QueueEncryption.KMS_MANAGED
        });
    }
}
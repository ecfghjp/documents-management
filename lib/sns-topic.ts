//create sns topic and a subscription
import * as cdk from '@aws-cdk/core'
import * as sns from '@aws-cdk/aws-sns';
import * as subs from '@aws-cdk/aws-sns-subscriptions';


//created a sns topic for documents and added a subcription to it
interface SnsTopicProps{
    topicName: string
}

export class SnsTopic extends cdk.Construct{
    public readonly topic: sns.Topic;
    constructor(scope: cdk.Construct, id: string, props: SnsTopicProps) {
        super(scope, id);
         this.topic = new sns.Topic(this, 'DocumentsTopic', {
            topicName: props.topicName,
            displayName: 'Customer subscription topic'
        });
    }
}
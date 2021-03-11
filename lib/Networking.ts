import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import { SubnetType } from '@aws-cdk/aws-ec2';


interface NetworkingProps{
    maxAZs : number
}

export class Networking extends cdk.Construct{
    public readonly vpc: ec2.IVpc


    constructor(scope: cdk.Construct, id: string, props: NetworkingProps) {
        super(scope, id);

        this.vpc = new ec2.Vpc(this,"MyDocumentsVPC",{
            cidr: '10.0.0.0/16',
            maxAzs: props.maxAZs,
            subnetConfiguration:[
                {
                    subnetType: ec2.SubnetType.PUBLIC,
                    name: 'Public',
                    cidrMask: 24
                },
                {
                    subnetType: ec2.SubnetType.PRIVATE,
                    name: 'Private',
                    cidrMask: 24
                }
            ],

        })

    }
} 
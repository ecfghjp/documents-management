import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import * as path from 'path'
import * as ecsp from '@aws-cdk/aws-ecs-patterns'
import * as ecs from '@aws-cdk/aws-ecs'
import * as apig from '@aws-cdk/aws-apigatewayv2'

interface WebserverProps{
    vpc: ec2.IVpc
    api : apig.HttpApi
}

export class Webserver extends cdk.Construct{
    public readonly vpc: ec2.IVpc


    constructor(scope: cdk.Construct, id: string, props: WebserverProps) {
        super(scope, id);
        //create dockert immage asset in ECR
        const webServerDocker = new DockerImageAsset(this,'WebServerDockerAsset',{
            directory:path.join(__dirname,'..','containers','webserver')
        });

        //automate use of fargate
        const fargateService = new ecsp.ApplicationLoadBalancedFargateService(this,'WebServiceFGargateService',{
            vpc: props.vpc,
            taskImageOptions:{
                image: ecs.ContainerImage.fromDockerImageAsset(webServerDocker),
                environment:{
                    PORT: '8080',
                    API_BASE: props.api.url!,
                },
                containerPort:8080
            }
        });

        new cdk.CfnOutput(this,'WebServerHost',{
            exportName: 'WebServerHost',
            value: fargateService.loadBalancer.loadBalancerName
        })


    }
}

import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda-nodejs'
import {Runtime} from '@aws-cdk/aws-lambda'
import * as path from 'path'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as apig from '@aws-cdk/aws-apigatewayv2'
import {LambdaProxyIntegration} from '@aws-cdk/aws-apigatewayv2-integrations'


interface DocumentManagementApiProps{
    documentsBucket: s3.IBucket
}

export class DocumentManagementApi extends cdk.Construct{

    public readonly httpApi: apig.HttpApi;
    constructor(scope: cdk.Construct, id: string, props: DocumentManagementApiProps) {
        super(scope, id);

        //calls a lambda function defining entry point(ejs file ) and data to be passed to the ejs file
        const getDocumentsFunction = new lambda.NodejsFunction(this,'GetDocumentsLambdaFunction',{
            runtime: Runtime.NODEJS_12_X,
            entry: path.join(__dirname,'..','api','get-documents','index.ts'),
            handler: 'getDocuments',
            environment:{
                DOCUMENT_BUCKET_NAME: props.documentsBucket.bucketName
            },
        });

        //publish message to queue as well
        
        //gives permissions for the lambda to access the bucket
        const bucketContainerPermissions = new iam.PolicyStatement();
        bucketContainerPermissions.addResources(props.documentsBucket.bucketArn);
        bucketContainerPermissions.addActions('s3:ListBucket');
        getDocumentsFunction.addToRolePolicy(bucketContainerPermissions);

        const bucketPermissions = new iam.PolicyStatement();
        bucketPermissions.addResources(`${props.documentsBucket.bucketArn}/*`);
        bucketPermissions.addActions('s3:GetObject','s3:PutObject');
        getDocumentsFunction.addToRolePolicy(bucketPermissions);

        //carete integration - npm install @aws-cdk/aws-apigatewayv2-integrations --save
        //creates integration between api and lambda function
        const httpIntegration = new LambdaProxyIntegration({
            handler: getDocumentsFunction
        });

        //create api gateway
         this.httpApi = new apig.HttpApi(this,'HttpApi',{
            apiName: 'document-management-api',
            createDefaultStage: true,
            corsPreflight:{
                allowMethods:[apig.HttpMethod.GET],
                allowOrigins: ['*'],
                maxAge: cdk.Duration.days(10)
            }
        })

        

        //add routes
        //add http routes to api 
        this.httpApi.addRoutes({
            path: '/getdocuments',
            methods:[
                apig.HttpMethod.GET
            ],
            integration: httpIntegration
        })

        new cdk.CfnOutput(this,'ApiGateway',{
            value: this.httpApi.url!,
            exportName: 'ApiEndpoint'
        })

        //give access to lambda api to access lambda




    }
}

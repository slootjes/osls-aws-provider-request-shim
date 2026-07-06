'use strict';

/**
 * Compatibility plugin for provider.request() method
 * Adds AWS SDK v3 compatibility layer for legacy plugins that use provider.request()
 */
class OslsLegacyAwsRequestPlugin {
    constructor(serverless, options, { log } = {}) {
        this.serverless = serverless;
        this.options = options;
        this.log = log || {
            debug: serverless.cli.log,
            info: serverless.cli.log,
            warning: serverless.cli.log,
        };

        this.hooks = {
            initialize: this.addRequestMethod.bind(this),
        };
    }

    addRequestMethod() {
        const provider = this.serverless.getProvider('aws');
        if (!provider) {
            return;
        }

        const serviceClientMap = {
            CloudFormation: { package: '@aws-sdk/client-cloudformation', client: 'CloudFormationClient' },
            StepFunctions: { package: '@aws-sdk/client-sfn', client: 'SFNClient' },
            Lambda: { package: '@aws-sdk/client-lambda', client: 'LambdaClient' },
            S3: { package: '@aws-sdk/client-s3', client: 'S3Client' },
            STS: { package: '@aws-sdk/client-sts', client: 'STSClient' },
            IAM: { package: '@aws-sdk/client-iam', client: 'IAMClient' },
            ECR: { package: '@aws-sdk/client-ecr', client: 'ECRClient' },
            ApiGateway: { package: '@aws-sdk/client-api-gateway', client: 'APIGatewayClient' },
            ApiGatewayV2: { package: '@aws-sdk/client-apigatewayv2', client: 'ApiGatewayV2Client' },
            CloudWatch: { package: '@aws-sdk/client-cloudwatch', client: 'CloudWatchClient' },
            CloudWatchLogs: { package: '@aws-sdk/client-cloudwatch-logs', client: 'CloudWatchLogsClient' },
            EventBridge: { package: '@aws-sdk/client-eventbridge', client: 'EventBridgeClient' },
            SSM: { package: '@aws-sdk/client-ssm', client: 'SSMClient' },
            CognitoIdentityProvider: { package: '@aws-sdk/client-cognito-identity-provider', client: 'CognitoIdentityProviderClient' },
        };

        provider.request = async function(service, method, params) {
            const serviceConfig = serviceClientMap[service];

            if (!serviceConfig) {
                throw new Error(
                    `AWS service "${service}" is not supported in the compatibility layer. ` +
                    'Please add it to the serviceClientMap in serverless-osls-legacy-aws-request.js'
                );
            }

            try {
                let awsModule;
                try {
                    awsModule = require(serviceConfig.package);
                } catch (requireError) {
                    if (requireError.code === 'MODULE_NOT_FOUND') {
                        throw new Error(
                            `${serviceConfig.package} not found. Install it using: npm i ${serviceConfig.package} -D`
                        );
                    }
                    throw requireError;
                }

                const serviceClient = awsModule[serviceConfig.client];

                if (!serviceClient) {
                    throw new Error(
                        `Could not find ${serviceConfig.client} in ${serviceConfig.package}`
                    );
                }

                const commandName = method.charAt(0).toUpperCase() + method.slice(1) + 'Command';
                const Command = awsModule[commandName];

                if (!Command) {
                    throw new Error(
                        `Could not find ${commandName} in ${serviceConfig.package}`
                    );
                }

                const config = await this.getAwsSdkV3Config();
                const client = new serviceClient(config);
                const command = new Command(params);

                return await client.send(command);
            } catch (error) {
                throw new Error(`Error calling ${service}.${method}: ${error.message}`);
            }
        };

        this.log.debug('Added provider.request() compatibility layer');
    }
}

module.exports = OslsLegacyAwsRequestPlugin;

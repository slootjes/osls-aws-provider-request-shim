# osls-aws-provider-request-shim

A compatibility plugin for [OSLS](https://github.com/oss-serverless/osls) v4 that adds an AWS SDK v3 compatibility layer for legacy plugins that use `provider.request()`.

## Overview

OSLS v4 removed the `provider.request()` method that many legacy Serverless plugins relied on. This plugin restores that functionality by shimming the method with AWS SDK v3 client calls, allowing older plugins to work seamlessly with OSLS v4.

## Installation

```bash
npm install osls-aws-provider-request-shim --save-dev
```

## Usage

Add the plugin to your `serverless.yml` file. **Important:** This plugin must be loaded **before** any plugins that depend on `provider.request()`.

```yaml
plugins:
  - osls-aws-provider-request-shim
  # Add other plugins that use provider.request() after this one
  - some-legacy-plugin
```

## How It Works

The plugin intercepts the `initialize` hook and adds a `request()` method to the AWS provider. When called, it:

1. Maps the service name to the appropriate AWS SDK v3 package
2. Dynamically requires the necessary client and command
3. Executes the command using the provider's AWS SDK v3 configuration
4. Returns the result in the same format as the legacy method

## Supported AWS Services

The plugin currently supports the following AWS services:

- **CloudFormation** - `@aws-sdk/client-cloudformation`
- **StepFunctions** - `@aws-sdk/client-sfn`
- **Lambda** - `@aws-sdk/client-lambda`
- **S3** - `@aws-sdk/client-s3`
- **STS** - `@aws-sdk/client-sts`
- **IAM** - `@aws-sdk/client-iam`
- **ECR** - `@aws-sdk/client-ecr`
- **API Gateway** - `@aws-sdk/client-api-gateway`
- **API Gateway V2** - `@aws-sdk/client-apigatewayv2`
- **CloudWatch** - `@aws-sdk/client-cloudwatch`
- **CloudWatch Logs** - `@aws-sdk/client-cloudwatch-logs`
- **EventBridge** - `@aws-sdk/client-eventbridge`
- **SSM** - `@aws-sdk/client-ssm`
- **Cognito Identity Provider** - `@aws-sdk/client-cognito-identity-provider`

To permanently add support for a service, you can create a pull request.

## Compatibility

These plugins work using this plugin:

- serverless-stack-termination-protection
- serverless-step-functions

## Requirements

- **OSLS/Serverless Framework**: >= 4.0.0
- **AWS SDK v3 packages**: Install as needed (the plugin will tell you which ones)

# osls-aws-provider-request-shim

A compatibility plugin for OSLS (Serverless Framework v4 fork) that adds an AWS SDK v3 compatibility layer for legacy plugins that use `provider.request()`.

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

### Adding Additional Services

If you need a service that's not listed above, you'll need to install the corresponding AWS SDK v3 package as a dev dependency. The plugin will provide a helpful error message with the exact command to run:

```bash
npm install @aws-sdk/client-[service-name] --save-dev
```

To permanently add support for a service, you can fork this plugin and add the service to the `serviceClientMap` in `index.js`.

## Example

Here's an example of a legacy plugin using `provider.request()`:

```javascript
class MyLegacyPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.provider = this.serverless.getProvider('aws');
    
    this.hooks = {
      'after:deploy:deploy': this.afterDeploy.bind(this)
    };
  }
  
  async afterDeploy() {
    // This will now work with OSLS v4 when using this shim plugin
    const result = await this.provider.request('Lambda', 'getFunction', {
      FunctionName: 'my-function'
    });
    
    console.log('Function ARN:', result.Configuration.FunctionArn);
  }
}

module.exports = MyLegacyPlugin;
```

With this shim plugin installed, the above code will work without modification.

## Requirements

- **Node.js**: >= 14.0
- **OSLS/Serverless Framework**: >= 4.0.0
- **AWS SDK v3 packages**: Install as needed (the plugin will tell you which ones)

## Peer Dependencies

This plugin requires OSLS (or Serverless Framework) version 4.0.0 or higher.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any issues or need support for additional AWS services, please [open an issue](https://github.com/yourusername/osls-aws-provider-request-shim/issues).

## Version History

### 1.0.0
- Initial release
- Support for 14 common AWS services
- Dynamic AWS SDK v3 package loading
- Helpful error messages for missing packages

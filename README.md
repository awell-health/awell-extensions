# Awell Extensions

You can find all the documentation [here](https://developers.awellhealth.com/awell-extensions/docs/getting-started/what-are-awell-extensions).

# Contributing to the repository

Read about our contributing guidelines [here](https://developers.awellhealth.com/awell-extensions/docs/getting-started/contributing-guidelines). To contribute code, you'll need to first fork the repository. Once you have forked the repository, create your extension (or make your changes) and submit a pull request for our team to review.

**Reviews may take 24 hours or longer. To help smooth the process, please be sure your `settings`, `fields`, and `datapoints` are well defined and documented.**

Of course, we also welcome [discussions](https://github.com/awell-health/awell-extensions/discussions)... show us what you're working on!

## Building your own extension

We encourage you to fork the repo and build custom actions and webhooks to support your organization's needs. We have provided a sample `hello world` extension, which is located in `./extensions/hello-world`.

## Releasing Extensions

When updates are made to the public extensions repository, the release process involves:
- Packaging a new release by merging into the `main` branch (internal engineers can test locally by creating a `release/vX.X.X` branch)
- Updating the `@awell-health/awell-extensions` dependency version in our private `awell-extension-server` repository
- Publishing a release of our private repository
- Deploying that release to staging/sandbox/production environments

This process is currently manual, and we ask you to please be patient with our PR reviews and deployments while we work to automate this process.

### Actions and webhooks

Please read about [custom actions](https://developers.awellhealth.com/awell-extensions/docs/custom-actions/what-are-custom-actions) and [webhooks](https://developers.awellhealth.com/awell-extensions/docs/webhooks/what-are-webhooks) to learn about how you can use them to support no-code flows for your care ops builders.

### Validating fields and datapoints

Fields are the INPUT, and datapoints are the OUTPUT of any given action (or webhook).

#### Fields

Fields are filled in at ![BUILD] time by the care flow designer. Field types can help the designer to be sure to include the right data necessary for a given action.

#### Datapoints

Datapoints are decided at ![BUILD] time and can be used by the designers as inputs for future fields.

#### Putting fields and datapoints together

Fields and datapoints provide you, the builders and designers, a powerful mechanism to take in variable data at one point in a care flow and use it in another place. The possibilities are endless!

### Extending OAuth
For those who require OAuth2.0 in your flows, there is a base client available in `@awell-health/extensions-core`. By extending that base client, you can include more complex authentication flows in your custom actions. Please see `./extensions/elation/client.ts` for an example of how you can create DataWrappers, API Clients, and the necessary datawrapper constructor that must be passed to the API client to create your flows.
Currently supported are Resource Owner Password Grant and Client Credentials Grant.

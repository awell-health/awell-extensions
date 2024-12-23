# Awell Extensions

You can find all the documentation [here](https://developers.awellhealth.com/awell-extensions/docs/getting-started/what-are-awell-extensions).

# Contributing to the repository

Read about our contributing guidelines [here](https://developers.awellhealth.com/awell-extensions/docs/getting-started/contributing-guidelines). To contribute code, you'll need to first fork the repository. Once you have forked the repository, create your extension (or make your changes) and submit a pull request for our team to review.

## "How long will it take for my PR to be reviewed?"

**Reviews may take between 2-5 business days to complete.** Please review our [contributing guidelines](https://developers.awellhealth.com/awell-extensions/docs/getting-started/contributing-guidelines) for our internal guidelines around PR reviews.

To help keep the PR process smooth, please try and remember to:

- Make sure your `settings`, `fields`, and `datapoints` are well defined and documented, including the use of [zod validation](https://zod.dev/);
- You have unittest coverage for your extension (see below for more details);
- You have included/updated the `README.md` and `CHANGELOG.md` files with your changes;
- Your code is formatted using `prettier` and `eslint` (see below for more details).

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

### Testing extension actions

Extension actions can be tested in three ways. You can:

1. Create unit tests (recommended);
2. Use Cloud Pub/sub emulator ([instructions](https://developers.awellhealth.com/awell-extensions/docs/custom-actions/test-your-custom-actions)); or
3. Test deployed extensions in Awell Studio

Testing extensions in design is a great way to test your extension actions because it allows you to interact with real world components. If you want to test your extension in Awell Studio, be sure to set `previewable: true` in the extension action's settings.
Finally, if your extension action requires some sort of asynchronous completion by the user (e.g. cal.com's extension allows a user to book an appointment in Awell Hosted Pages), then you _will not_ be able to set `previewable: true` and the extension is not testable in this way.

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

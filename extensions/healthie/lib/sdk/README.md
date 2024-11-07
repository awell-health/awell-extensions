graphql-codegen is the old SDK for Healthie, don't use it anymore for new actions but still in use for old actions

genql is the new one, use that one for new actions.

To regenerate the types run `yarn generate-healthie-sdk` in root directory

If you are getting an error: `either "endpoint", "fetcher" or "schema" must be defined in the config`
1. go to `/awell-extensions/extensions/healthie/lib/sdk/genql/generateSdk.ts`
2. replace the `endpoint` with healthie `https://staging-api.gethealthie.com/graphql`
3. run `yarn generate-healthie-sdk`
4. revert your changes in `generateSdk.ts` file
import type { CodegenConfig } from '@graphql-codegen/cli'

/**
 * Run with the below command:
 * yarn graphql-code-generator --config extensions/healthie/lib/sdk/graphql-codegen/codegen.ts
 */
const config: CodegenConfig = {
  schema: 'https://staging-api.gethealthie.com/graphql',
  generates: {
    'extensions/healthie/lib/sdk/graphql-codegen/generated/sdk.ts': {
      documents:
        'extensions/healthie/lib/sdk/graphql-codegen/graphql/*.graphql',
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        rawRequest: true,
      },
    },
  },
}
export default config

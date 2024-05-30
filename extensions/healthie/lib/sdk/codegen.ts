import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://staging-api.gethealthie.com/graphql',
  generates: {
    'extensions/healthie/lib/sdk/generated/sdk.ts': {
      documents: 'extensions/healthie/lib/sdk/graphql/*.graphql',
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

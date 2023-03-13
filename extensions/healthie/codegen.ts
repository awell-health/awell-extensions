import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://staging-api.gethealthie.com/graphql',
  generates: {
    'extensions/healthie/gql/sdk.ts': {
      documents: 'extensions/healthie/actions/graphql/*.graphql',
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

import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://staging-api.gethealthie.com/graphql',
  generates: {
    './gql/sdk.ts': {
      documents: './actions/graphql/*.graphql',
      overwrite: true,
      schema: 'https://staging-api.gethealthie.com/graphql',
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

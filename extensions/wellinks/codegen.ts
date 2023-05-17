import type { CodegenConfig } from '@graphql-codegen/cli'


const config: CodegenConfig = {
    overwrite: true,
    schema: 'https://staging-api.gethealthie.com/graphql',
    documents: 'extensions/wellinks/graphql/*.ts',
    generates: {
      'extensions/wellinks/gql/sdk.ts': {
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
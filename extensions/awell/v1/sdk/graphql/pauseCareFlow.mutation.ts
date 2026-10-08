export const pauseCareFlowMutation = `
mutation PauseCareFlow($input: PauseCareFlowInput!) {
    pauseCareFlow(input: $input) {
      code
      success
    }
  }
`

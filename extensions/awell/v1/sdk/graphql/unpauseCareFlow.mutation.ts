export const unpauseCareFlowMutation = `
mutation UnpauseCareFlow($input: UnpauseCareFlowInput!) {
    unpauseCareFlow(input: $input) {
      code
      success
    }
  }
`

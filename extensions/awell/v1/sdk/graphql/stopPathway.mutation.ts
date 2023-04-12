export const stopPathwayMutation = `
mutation StopPathway($input: StopPathwayInput!) {
    stopPathway(input: $input) {
      code
      success
    }
  }  
`

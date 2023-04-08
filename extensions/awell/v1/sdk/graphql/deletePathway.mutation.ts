export const deletePathwayMutation = `
mutation DeletePathway($input: DeletePathwayInput!) {
    deletePathway(input: $input) {
      success
    }
  }  
`

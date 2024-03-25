export const updateBaselineInfoMutation = `
mutation UpdateBaselineInfo($input: UpdateBaselineInfoInput!) {
  updateBaselineInfo(input: $input) {
      code
      success
  }
}
`

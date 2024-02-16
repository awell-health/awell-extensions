export const AthenaClient = jest.fn().mockImplementation(() => {
  return {
    getPatient: jest.fn(),
  }
})

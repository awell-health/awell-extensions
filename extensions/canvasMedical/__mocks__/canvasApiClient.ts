import mockPatient from './patient'

export const mockMakeAPIClient = (): any => {
  return {
    getPatient: jest.fn(async () => mockPatient),
  }
}

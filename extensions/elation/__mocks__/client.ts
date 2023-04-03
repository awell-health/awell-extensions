import { patientExample } from "./constants";

const ElationAPIClientMock = jest.fn().mockImplementation((params) => {
  return {
    getPatient: jest.fn((params) => {
      return { id: 1, ...patientExample }
    }),
    createPatient: jest.fn((params) => {
      return { id: 1, ...patientExample }
    }),
    updatePatient: jest.fn((params) => {
      return { id: 1, ...patientExample }
    }),
  };
});

export {
  ElationAPIClientMock as ElationAPIClient
};

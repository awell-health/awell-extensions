const ElationAPIClientMock = jest.fn().mockImplementation((params) => {
  return {
    getPatient: jest.fn((params) => {
      return { first_name: 'First', last_name: 'Last' }
    }),
    createPatient: jest.fn((params) => {
      return { id: 1 }
    }),
  };
});

export {
  ElationAPIClientMock as ElationAPIClient
};

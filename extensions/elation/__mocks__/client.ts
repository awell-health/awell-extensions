const ElationAPIClientMock = jest.fn().mockImplementation((params) => {
  return {
    getPatient: jest.fn((params) => {
      return { first_name: 'First', last_name: 'Last' }
    }),
  };
});

export {
  ElationAPIClientMock as ElationAPIClient
};

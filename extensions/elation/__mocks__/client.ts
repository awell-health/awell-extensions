const ElationAPIClientMock = jest.fn().mockImplementation((params) => {
  console.log('Calling mock elation constructor', params)

  return {
    getPatient: jest.fn((params) => {
      return { first_name: 'First', last_name: 'Last' }
    }),
  };
});

export {
  ElationAPIClientMock as ElationAPIClient
};

const mockInitialiseClient = jest.fn().mockImplementation((params) => {
  console.log('mockInitialiseClient:', params)

  return {};
});

export { mockInitialiseClient as initialiseClient }

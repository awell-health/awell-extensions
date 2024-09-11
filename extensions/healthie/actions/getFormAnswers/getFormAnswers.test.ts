// TODO

describe('Healthie - Get form answers', () => {
  test('Should work', async () => {
    expect(true).toBe(true)
  })
})

// import { generateTestPayload } from '../../../../src/tests'
// import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
// import {
//   mockGetSdk,
//   mockGetSdkReturn,
// } from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
// import { getFormAnswers } from '.'

// // jest.mock('../../gql/sdk')
// // jest.mock('../../graphqlClient')

// describe('Healthie - Get form answers', () => {
//   const onComplete = jest.fn()

//   // beforeAll(() => {
//   //   ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
//   // })

//   // beforeEach(() => {
//   //   jest.clearAllMocks()
//   // })

//   test('Should work', async () => {
//     await getFormAnswers.onActivityCreated!(
//       generateTestPayload({
//         fields: {
//           id: '462349',
//         },
//         settings: {
//           apiUrl: 'https://staging-api.gethealthie.com/graphql',
//           apiKey:
//             'todo',
//         },
//       }),
//       onComplete,
//       jest.fn()
//     )

//     // expect(mockGetSdkReturn.applyTagsToUser).toHaveBeenCalled()
//     expect(onComplete).toHaveBeenCalledWith({ hello: 'world' })
//   })
// })

import { HealthieSdk } from './HealthieSdk'

describe('HealthieSdk', () => {
  test('Setup', async () => {
    const sdk = new HealthieSdk({
      apiUrl: 'https://staging-api.gethealthie.com/graphql',
      // Replace with your API key if you want this test to work
      apiKey: 'YOUR_API_KEY',
    })

    const res = await sdk.client.query({
      tags: {
        id: true,
        name: true,
      },
    })

    console.log(res)
    expect(res).not.toBe(null)
  })
})

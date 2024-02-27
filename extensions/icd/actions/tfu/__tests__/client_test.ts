import { client } from '../../../client'
describe('asdf', () => {
  it('test client', async () => {
    const resp = await client.getICDCode({ code: 'E10.0' })
    expect(resp).toStrictEqual('Type 1 Diabetes mellitus')
  })
})

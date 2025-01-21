import { constructPrivateKey } from './constructPrivateKey'

const ESCAPED_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\naaaaaaa\nbbbbb\nT62++bneShPHC6MB4Juo8OzZyn3XbNmyXxlnYgfnuy3PxF+lDg74IhApeW54u29t\ncccc\no0sppFxaEI36IFnyOOvmrFfJAO13nrMRuDLZeN9bHyZ4I+qQ2YRJmdN9fltQFZMQ\na/2n1dv00nX1Pd+mayOAV0fF20obDoI4gqZRaikG/gnNn7+ufIvxNdClft6INLhb\nddddd\nPEpsOnUyvQKBgD0ao0KxPiNSoTlV0OT8+SW+Wr8UxqCg/3JdT1+CxpER489PR1my\ngggg\nE9kfri8cvi1B+xxJu8paMitvwTYF6HU72bR5N2Yk4LXcMiHVln4gUji9cKkbQBvo\n-----END PRIVATE KEY-----`

const EXPECTED_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
aaaaaaa
bbbbb
T62++bneShPHC6MB4Juo8OzZyn3XbNmyXxlnYgfnuy3PxF+lDg74IhApeW54u29t
cccc
o0sppFxaEI36IFnyOOvmrFfJAO13nrMRuDLZeN9bHyZ4I+qQ2YRJmdN9fltQFZMQ
a/2n1dv00nX1Pd+mayOAV0fF20obDoI4gqZRaikG/gnNn7+ufIvxNdClft6INLhb
ddddd
PEpsOnUyvQKBgD0ao0KxPiNSoTlV0OT8+SW+Wr8UxqCg/3JdT1+CxpER489PR1my
gggg
E9kfri8cvi1B+xxJu8paMitvwTYF6HU72bR5N2Yk4LXcMiHVln4gUji9cKkbQBvo
-----END PRIVATE KEY-----`

describe('constructPrivateKey', () => {
  it('should format a private key', () => {
    const formattedKey = constructPrivateKey(ESCAPED_PRIVATE_KEY)
    expect(formattedKey).toBe(EXPECTED_PRIVATE_KEY)
  })

  it('should leave the key as is if it is already formatted', () => {
    const formattedKey = constructPrivateKey(EXPECTED_PRIVATE_KEY)
    expect(formattedKey).toBe(EXPECTED_PRIVATE_KEY)
  })
})

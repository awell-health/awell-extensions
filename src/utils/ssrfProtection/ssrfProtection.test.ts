import axios from 'axios'
import http from 'http'
import { useAgent } from 'request-filtering-agent'

/**
 * A contract test for the dependency, not for our own code.
 *
 * Several extensions fetch URLs supplied by a care flow or a webhook payload, from inside the
 * cluster. `useAgent()` from request-filtering-agent is what stops those from reaching the node's
 * own services, the pod network, or the cloud metadata endpoint. That protection is a dependency
 * behaviour, so an upgrade could silently weaken it -- 1.x, for instance, let HTTPS requests to
 * 127.0.0.1 through entirely (GHSA-pw25-c82r-75mm, fixed in 2.0.0).
 *
 * These cases are all offline: literal addresses, and a real server on loopback. The library also
 * validates AFTER DNS resolution, which defeats DNS-rebinding names such as `127.0.0.1.nip.io`;
 * that is verified in docs/standards/sast-finding-remediation.md rather than here, so CI does not
 * depend on a third-party resolver.
 */
const fetchThrough = (url: string) =>
  axios.get(url, { httpAgent: useAgent(url), httpsAgent: useAgent(url), timeout: 5000 })

describe('SSRF protection for extension-supplied URLs', () => {
  let server: http.Server
  let loopbackUrl = ''

  beforeAll(async () => {
    server = http.createServer((_req, res) => {
      res.writeHead(200)
      res.end('internal-only')
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    loopbackUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}/`
  })

  afterAll(() => {
    server.close()
  })

  it('refuses a real service listening on loopback', async () => {
    await expect(fetchThrough(loopbackUrl)).rejects.toThrow(/is not allowed/i)
  })

  it.each([
    ['cloud metadata', 'http://169.254.169.254/latest/meta-data/'],
    ['cloud metadata as IPv4-mapped IPv6', 'http://[::ffff:169.254.169.254]/'],
    ['IPv6 loopback', 'http://[::1]/'],
    ['RFC1918 10/8', 'http://10.0.0.1/'],
    ['RFC1918 172.16/12', 'http://172.16.0.1/'],
    ['RFC1918 192.168/16', 'http://192.168.0.1/'],
    ['HTTPS to loopback (the 1.x bypass)', 'https://127.0.0.1/'],
  ])('refuses %s', async (_label, url) => {
    await expect(fetchThrough(url)).rejects.toThrow(/is not allowed/i)
  })
})

import fetch from 'node-fetch'
import * as xml2js from 'xml2js'
import { isNil } from 'lodash'
export class WellinksFlourishClient {
  private readonly _apiUrl: string
  private readonly _apiKey: string
  private readonly _clientextid: string

  constructor(apiUrl: string, apiKey: string, clientextid: string) {
    this._apiKey = apiKey
    this._apiUrl = apiUrl
    this._clientextid = clientextid
  }

  readonly user = {
    exists: async (identifier: string): Promise<boolean> => {
      try {
        const response = await fetch(`${this._apiUrl}/checkifuserexists`, {
          method: 'POST',
          body: buildCheckIfUserExistsRequest(
            identifier,
            this._clientextid,
            this._apiKey
          ), // call to func,
          headers: {
            contentType: 'text/xml',
            accept: 'application/xml',
          },
        })
        xml2js.parseString(response.body, (err, result) => {
          if (!isNil(err)) {
            throw err
          } else {
            return result.statusMessage[0] === 'Success'
          }
        })
        return false
      } catch {
        return false
      }
    },
  }
}

function buildCheckIfUserExistsRequest(
  identifier: string,
  clientextid: string,
  apiKey: string
): string {
  return `
  <?xml version="1.0" encoding="utf-8" ?>
  <request>
      <user>
          <clientextid>${clientextid}</clientextid>
          <clientpasskey>${apiKey}</clientpasskey>
          <thirdpartyidentifier>${identifier}</thirdpartyidentifier>
      </user>
  </request>
  `
}

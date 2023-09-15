import fetch from 'node-fetch'
import * as xml2js from 'xml2js'
import { isNil } from 'lodash'
import { type FlourishSubmitPamSurveyResponse } from './types'
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

  readonly survey = {
    submit: async (
      language: string,
      adminDate: string,
      thirdPartyIdentifier: string,
      gender: string,
      age: number,
      pa1: number,
      pa2: number,
      pa3: number,
      pa4: number,
      pa5: number,
      pa6: number,
      pa7: number,
      pa8: number,
      pa9: number,
      pa10: number,
      pa11: number,
      pa12: number,
      pa13: number
    ): Promise<FlourishSubmitPamSurveyResponse> => {
      try {
        const response = await fetch(`${this._apiUrl}/submitpamsurvey`, {
          method: 'POST',
          body: buildSubmitPamSurveyRequest(
            this._clientextid,
            this._apiKey,
            language,
            adminDate,
            thirdPartyIdentifier,
            gender,
            age,
            pa1,
            pa2,
            pa3,
            pa4,
            pa5,
            pa6,
            pa7,
            pa8,
            pa9,
            pa10,
            pa11,
            pa12,
            pa13
          ),
          headers: {
            contentType: 'text/xml',
            accept: 'application/xml',
          },
        })
        xml2js.parseString(
          response.body,

          (err, result) => {
            if (!isNil(err)) {
              throw err
            } else {
              return {
                success:
                  result.UserSurveyResponseData.StatusMessage[0] ===
                  'Submit User Survey success.',
                pamLevel:
                  +result.UserSurveyResponseData.SurveyResult[0].ResponseData[0].Type.find(
                    (type: any) => type.$.id === 'PAMLevel'
                  ).$.value,
                pamScore:
                  +result.UserSurveyResponseData.SurveyResult[0].ResponseData[0].Type.find(
                    (type: any) => type.$.id === 'PAMScore'
                  ).$.value,
              }
            }
          }
        )
        return {
          success: false,
          pamLevel: -1,
          pamScore: -1,
        }
      } catch {
        return {
          success: false,
          pamLevel: -1,
          pamScore: -1,
        }
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

function buildSubmitPamSurveyRequest(
  clientextid: string,
  apiKey: string,
  language: string,
  adminDate: string,
  thirdPartyIdentifier: string,
  gender: string,
  age: number,
  pa1: number,
  pa2: number,
  pa3: number,
  pa4: number,
  pa5: number,
  pa6: number,
  pa7: number,
  pa8: number,
  pa9: number,
  pa10: number,
  pa11: number,
  pa12: number,
  pa13: number
): string {
  const adminDateValue = new Date(adminDate)
  return `
  <?xml version="1.0" encoding="utf-8" ?>
<Request>
    <user>
        <clientextid>${clientextid}</clientextid>
        <clientpasskey>${apiKey}</clientpasskey>
        <thirdpartyidentifier>${thirdPartyIdentifier}</thirdpartyidentifier>
    </user>
    <Survey>
    <Language>${language}</Language>
    <SurveyName>PAM13_S</SurveyName>
    <Administration day=${adminDateValue.getDate()} month=${adminDateValue.getMonth()} year=${adminDateValue.getFullYear()} />
        <SurveyResponse Age=${age} Gender=${gender} SurveyDeliveryMode="Online">
        <Answer ID="PA1">${pa1}</Answer>
        <Answer ID="PA2">${pa2}</Answer>
        <Answer ID="PA3">${pa3}</Answer>
        <Answer ID="PA4">${pa4}</Answer>
        <Answer ID="PA5">${pa5}</Answer>
        <Answer ID="PA6">${pa6}</Answer>
        <Answer ID="PA7">${pa7}</Answer>
        <Answer ID="PA8">${pa8}</Answer>
        <Answer ID="PA9">${pa9}</Answer>
        <Answer ID="PA10">${pa10}</Answer>
        <Answer ID="PA11">${pa11}</Answer>
        <Answer ID="PA12">${pa12}</Answer>
        <Answer ID="PA13">${pa13}</Answer>
        </SurveyResponse>
    </Survey>
</Request>
  `
}

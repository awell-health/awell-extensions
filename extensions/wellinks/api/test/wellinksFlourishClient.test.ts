import { WellinksFlourishClient } from '../clients/wellinksFlourishClient'
import fetch from 'node-fetch'
jest.mock('node-fetch')

const { Response } = jest.requireActual('node-fetch')

describe('WellinksFlourishClient', () => {
  const apiKey = 'apiKey'
  const apiUrl = 'apiUrl'
  const clientextid = 'clientextid'
  const wellinksFlourishClient = new WellinksFlourishClient(
    apiUrl,
    apiKey,
    clientextid
  )
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('user exists', () => {
    test('should return true when the StatusMessage is affirmative.', async () => {
      const properResponse = `
          <UserExistsResponseData xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
          <StatusCode>Success_ExternalIdentifier</StatusCode>
          <StatusMessage>User with external identifier exists.</StatusMessage>
          <ExternalUserID>230905-OV92CZDC</ExternalUserID>
          <NationalPatientIdentifier i:nil="true"/>
          <ThirdPartyIdentifier>18071982001</ThirdPartyIdentifier>
          <UserName i:nil="true"/>
      </UserExistsResponseData>`
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(properResponse, {
          url: 'url',
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/xml', // Specify the content type as XML
          },
        })
      )
      const result = await wellinksFlourishClient.user.exists('identifier')
      expect(result).toBe(true)
    })
    test('should return false when the StatusMessage is negative.', async () => {
      const properResponse = `
          <UserExistsResponseData xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
          <StatusCode>Success_ExternalIdentifier</StatusCode>
          <StatusMessage>User with external identifier doesn't exist or invalid.</StatusMessage>
          <ExternalUserID>230905-OV92CZDC</ExternalUserID>
          <NationalPatientIdentifier i:nil="true"/>
          <ThirdPartyIdentifier>18071982001</ThirdPartyIdentifier>
          <UserName i:nil="true"/>
      </UserExistsResponseData>`
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(properResponse, {
          url: 'url',
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/xml', // Specify the content type as XML
          },
        })
      )
      const result = await wellinksFlourishClient.user.exists('identifier')
      expect(result).toBe(false)
    })
    test('should throw an error when node-fetch fails', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
        throw new Error('something went wrong')
      })
      await expect(
        wellinksFlourishClient.user.exists('identifier')
      ).rejects.toThrowError(Error('Node Fetch failed: something went wrong'))
    })
  })

  describe('survey submit', () => {
    test('should return a FlourishSubmitPamSurveyResponse object on success', async () => {
      const properResponse = `
      <UserSurveyResponseData xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
    <StatusCode>Success_SurveySubmit</StatusCode>
    <StatusMessage>Submit User Survey success.</StatusMessage>
    <ExternalUserID>230905-OV92CZDC</ExternalUserID>
    <NationalPatientIdentifier i:nil="true"/>
    <SurveyEnteredDateTime>2023-09-05T00:00:00</SurveyEnteredDateTime>
    <SurveyName>PAM13_S</SurveyName>
    <SurveyResult>
        <ResponseData>
            <Type id="PAMLevel" value="1"/>
            <Type id="PAMScore" value="38.10"/>
        </ResponseData>
    </SurveyResult>
    <ThirdPartyIdentifier i:nil="true"/>
    <UserName i:nil="true"/>
</UserSurveyResponseData>
      `
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(properResponse, {
          url: 'url',
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/xml', // Specify the content type as XML
          },
        })
      )
      const result = await wellinksFlourishClient.survey.submit(
        'en',
        Date().toString(),
        'thirdpartyIdentifier',
        'male',
        22,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13
      )
      expect(result).toEqual({
        success: true,
        pamLevel: 1,
        pamScore: 38.1,
      })
    })
    test('should throw an error if node-fetch fails', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
        throw new Error('something went wrong')
      })
      await expect(
        wellinksFlourishClient.survey.submit(
          'en',
          Date().toString(),
          'thirdpartyIdentifier',
          'male',
          22,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13
        )
      ).rejects.toThrowError(Error('Node Fetch failed: something went wrong'))
    })
    test('should throw an error if the StatusCode is not affirmative', async () => {
      const wrongResponse = `
      <UserSurveyResponseData xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
    <StatusCode>Error_InvalidUserCredential</StatusCode>
    <StatusMessage>Sorry. We could not find user with the specified credentials.</StatusMessage>
    <ExternalUserID i:nil="true"/>
    <NationalPatientIdentifier i:nil="true"/>
    <SurveyEnteredDateTime>2023-09-05T00:00:00</SurveyEnteredDateTime>
    <SurveyName>PAM13_S</SurveyName>
    <SurveyResult i:nil="true"/>
    <ThirdPartyIdentifier i:nil="true"/>
    <UserName i:nil="true"/>
</UserSurveyResponseData>`

      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(wrongResponse, {
          url: 'url',
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/xml', // Specify the content type as XML
          },
        })
      )
      await expect(
        wellinksFlourishClient.survey.submit(
          'en',
          Date().toString(),
          'thirdpartyIdentifier',
          'male',
          22,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13
        )
      ).rejects.toThrowError(
        Error('Node Fetch failed: Survey was not correctly submitted')
      )
    })
  })
})

import type {
  QuestionnaireResponseWithId,
  QuestionnaireResponse,
} from '../validation/dto/questionnaireResponses.zod'

export const sampleCreateQuestionnaireResponsesResource: { id: string } = {
  id: '9176df1c-b284-43df-9662-c5839e9771f3',
}

export const sampleCreateQuestionnaireResponsesData: {
  questionnaireId: string
  subjectId: string
  authored: string
  authorId: string
  item: string
} = {
  questionnaireId: '6ec73d3e-d25a-4702-a45b-ff863982bb5c',
  subjectId: '01e226b6ad324595a4b7030d003db06f',
  authored: '2021-09-19T14:54:12.194952+00:00',
  authorId: 'e766816672f34a5b866771c773e38f3c',
  item: '[{"linkId":"a82466d1-1d80-486e-933f-139ba101977d","text":"Tobaccostatus","answer":[{"valueCoding":{"system":"http://snomed.info/sct","code":"8517006","display":"Formeruser"}}]}]',
}

export const sampleQuestionnaireResponseId: { id: string } = {
  id: '31365726-b823-4353-8c91-5d4f59d67ed3',
}

export const sampleQuestionnaireResponseData: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  meta: {
    versionId: '1',
    lastUpdated: '2023-08-29T08:43:42.160+00:00',
  },
  questionnaire: 'Questionnaire/6ec73d3e-d25a-4702-a45b-ff863982bb5c',
  status: 'completed',
  subject: {
    reference: 'Patient/01e226b6ad324595a4b7030d003db06f',
  },
  authored: '2021-09-19T14:54:12.194952+00:00',
  author: {
    reference: 'Practitioner/e766816672f34a5b866771c773e38f3c',
  },
  item: [
    {
      linkId: 'a82466d1-1d80-486e-933f-139ba101977d',
      text: 'Tobacco status',
      answer: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '8517006',
            display: 'Former user',
          },
        },
      ],
    },
  ],
}

export const sampleQuestionnaireResponseResource: QuestionnaireResponseWithId =
  {
    ...sampleQuestionnaireResponseId,
    ...sampleQuestionnaireResponseData,
  }

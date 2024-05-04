import { AwellFormToFhirQuestionnaire } from '.'
import { formDefinitionMock } from '../__testdata__'

describe('AwellFormResponsetoFhirQuestionnaireResponse', () => {
  test('Should work', async () => {
    const res = AwellFormToFhirQuestionnaire(formDefinitionMock)

    expect(res).toEqual({
      resourceType: 'Questionnaire',
      url: 'http://awellhealth.com/forms/q6OwH0yp2JKq',
      name: 'form-with-all-question-types-version-Z-N6CVFy9cv-',
      title: 'Form with all question types (version Z-N6CVFy9cv-)',
      status: 'unknown',
      version: 'Z-N6CVFy9cv-',
      publisher: 'Awell',
      contact: [
        {
          name: 'Awell',
          telecom: [{ system: 'email', value: 'info@awellhealth.com' }],
        },
      ],
      identifier: [
        {
          system: 'https://awellhealth.com/forms',
          value: 'q6OwH0yp2JKq/published/Z-N6CVFy9cv-',
        },
      ],
      item: [
        {
          linkId: 'MUha7ldV6gJL',
          text: '"<p class=\\"slate-p\\">This is a description question. It&#x27;s doesn&#x27;t collect any data but just shows some text to the user.</p>"',
          type: 'display',
        },
        {
          linkId: 'bVGD5I6ckKZx',
          text: 'Single select (number)',
          type: 'choice',
          answerOption: [
            { valueCoding: { code: '0', display: 'Option 1' } },
            { valueCoding: { code: '1', display: 'Option 2' } },
            { valueCoding: { code: '2', display: 'Option 3' } },
          ],
        },
        {
          linkId: 'KcvNZ5dJHPf0',
          text: 'Single select (string)',
          type: 'choice',
          answerOption: [
            { valueCoding: { code: 'option_1', display: 'Option 1' } },
            { valueCoding: { code: 'option_2', display: 'Option 2' } },
            { valueCoding: { code: 'option_3', display: 'Option 3' } },
            { valueCoding: { code: 'option_4', display: 'helloo' } },
            { valueCoding: { code: 'option_5', display: 'helloooooo' } },
            { valueCoding: { code: 'option_6', display: 'test' } },
          ],
        },
        {
          linkId: 'saf_RczvRbay',
          text: 'Multiple select (number)',
          type: 'choice',
          repeats: true,
          answerOption: [
            { valueCoding: { code: '0', display: 'Option 1' } },
            { valueCoding: { code: '1', display: 'Option 2' } },
            { valueCoding: { code: '2', display: 'Option 3' } },
            { valueCoding: { code: '3', display: 'Option 4' } },
          ],
        },
        {
          linkId: 'knDhobvb9xWJ',
          text: 'Multiple select (string)',
          type: 'choice',
          repeats: true,
          answerOption: [
            { valueCoding: { code: 'some option', display: 'Option 1' } },
            { valueCoding: { code: '3232', display: 'Option 2' } },
            { valueCoding: { code: 'another option', display: 'Option 3' } },
            { valueCoding: { code: 'option 4', display: 'fdsfds' } },
          ],
        },
        {
          linkId: '-hCGgfqR3zZ7',
          text: 'Yes or no? (boolean)',
          type: 'boolean',
        },
        { linkId: 'yiVk87BHUNYs', text: 'Slider', type: 'integer' },
        { linkId: 'ypR9Yudhfsbg', text: 'Date', type: 'dateTime' },
        {
          linkId: 'C9dHRQWojfkP',
          text: 'Question that collects a numeric value',
          type: 'integer',
        },
        {
          linkId: 'vn-VF15nIsv_',
          text: 'Question that collects a sstring value',
          type: 'string',
        },
        {
          linkId: 'PwQq1MVz3sYn',
          text: 'Question that collects a string but long-form (textarea)',
          type: 'text',
        },
        {
          linkId: 'uuir17H9iz9P',
          text: 'Question that collects a phone number',
          type: 'string',
        },
      ],
    })
  })
})

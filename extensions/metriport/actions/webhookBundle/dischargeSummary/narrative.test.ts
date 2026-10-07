import {
  attachmentText,
  collapseWhitespace,
  diagnosticReportText,
  htmlToText,
} from './narrative'

const base64 = (text: string): string => Buffer.from(text).toString('base64')

describe('Metriport discharge summary - narrative', () => {
  describe('htmlToText', () => {
    test('turns paragraphs, breaks and block ends into line breaks', () => {
      expect(
        htmlToText(
          '<div><p>First line.</p><p>Second<br/>third.</p><ul><li>one</li><li>two</li></ul></div>',
        ),
      ).toBe('First line.\nSecond\nthird.\none\ntwo')
    })

    test('turns table cells into spaces and rows into lines', () => {
      expect(
        htmlToText(
          '<table><tr><th>Drug</th><th>Dose</th></tr><tr><td>Aspirin</td><td>81 mg</td></tr></table>',
        ),
      ).toBe('Drug Dose\nAspirin 81 mg')
    })

    test('decodes named, decimal and hex entities', () => {
      expect(htmlToText('Tom &amp; Jerry &lt;3 &#8220;quoted&#x201D;&nbsp;!')).toBe(
        'Tom & Jerry <3 “quoted” !',
      )
    })

    test('leaves an unknown or invalid entity as written', () => {
      expect(htmlToText('&bogus; &#1114112;')).toBe('&bogus; &#1114112;')
    })

    test('drops script and style elements with their content', () => {
      expect(
        htmlToText('<style>p { color: red }</style><p>Kept</p><script>alert(1)</script>'),
      ).toBe('Kept')
    })

    test('collapses runs of blank lines to one', () => {
      expect(htmlToText('<p>a</p><p></p><p></p><p>b</p>')).toBe('a\n\nb')
    })
  })

  describe('collapseWhitespace', () => {
    test('normalises CRLF, trims lines and squeezes spaces', () => {
      expect(collapseWhitespace('  a   b \r\n\r\n\r\n\tc  \n')).toBe('a b\n\nc')
    })
  })

  describe('attachmentText', () => {
    test('decodes base64 text/plain', () => {
      expect(
        attachmentText({ contentType: 'text/plain', data: base64('Hello  world') }),
      ).toBe('Hello world')
    })

    test('decodes base64 text/html and strips the markup', () => {
      expect(
        attachmentText({
          contentType: 'text/html; charset=utf-8',
          data: base64('<p>Hello</p><p>world</p>'),
        }),
      ).toBe('Hello\nworld')
    })

    test('treats an attachment without a content type as text', () => {
      expect(attachmentText({ data: base64('plain') })).toBe('plain')
    })

    test('yields nothing for a non-text attachment, a missing payload or an empty one', () => {
      expect(
        attachmentText({ contentType: 'application/pdf', data: base64('%PDF-1.4') }),
      ).toBeUndefined()
      expect(attachmentText({ contentType: 'text/plain', url: 'https://x' })).toBeUndefined()
      expect(attachmentText({ contentType: 'text/plain', data: base64('  \n ') })).toBeUndefined()
    })
  })

  describe('diagnosticReportText', () => {
    test('reads the first readable presented form', () => {
      expect(
        diagnosticReportText({
          resourceType: 'DiagnosticReport',
          status: 'final',
          code: {},
          presentedForm: [
            { contentType: 'application/pdf', data: base64('%PDF') },
            { contentType: 'text/plain', data: base64('the note') },
          ],
        }),
      ).toBe('the note')
    })

    test('falls back to the conclusion, then to the narrative', () => {
      expect(
        diagnosticReportText({
          resourceType: 'DiagnosticReport',
          status: 'final',
          code: {},
          conclusion: 'No acute findings.',
          text: { status: 'generated', div: '<div>narrative</div>' },
        }),
      ).toBe('No acute findings.')
      expect(
        diagnosticReportText({
          resourceType: 'DiagnosticReport',
          status: 'final',
          code: {},
          text: { status: 'generated', div: '<div>narrative</div>' },
        }),
      ).toBe('narrative')
    })

    test('yields nothing for a report with no text anywhere', () => {
      expect(
        diagnosticReportText({ resourceType: 'DiagnosticReport', status: 'final', code: {} }),
      ).toBeUndefined()
    })
  })
})

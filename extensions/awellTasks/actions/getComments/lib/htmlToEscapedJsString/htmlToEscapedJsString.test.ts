import { htmlToEscapedJsString } from './htmlToEscapedJsString'

describe('htmlToEscapedJsString', () => {
  const tests = [
    {
      input: '<p>Hello, world!</p>',
      expected: 'Hello, world!',
    },
    {
      input: '<p>First paragraph</p><p><br></p><p>Second paragraph</p>',
      expected: 'First paragraph\n\nSecond paragraph',
    },
    {
      input: 'Line one<br>Line two',
      expected: 'Line one\nLine two',
    },
    {
      input: '<p>Line one<br>Line two</p>',
      expected: 'Line one\nLine two',
    },
    {
      input: '<ul><li>Item 1</li><li>Item 2</li></ul>',
      expected: '- Item 1\n- Item 2',
    },
    {
      input: '<ol><li>First</li><li>Second</li></ol>',
      expected: '1. First\n2. Second',
    },
    {
      input: '<p>Paragraph</p><ul><li>Item A</li><li>Item B</li></ul>',
      expected: 'Paragraph\n- Item A\n- Item B',
    },
    {
      input:
        '<div>Mixed content<br>with line breaks<ol><li>First</li><li>Second</li></ol></div>',
      expected: 'Mixed content\nwith line breaks\n1. First\n2. Second',
    },
    {
      input:
        '<h2>Test</h2><ul><li>List</li><li>List</li><li>List</li></ul><p><br></p><p>Hello world</p><p><br></p><p>More</p><p><br></p><p>More</p><p><br></p><p>More</p>',
      expected:
        'Test\n\n\n- List\n- List\n- List\n\nHello world\n\nMore\n\nMore\n\nMore',
    },
  ]

  tests.forEach(({ input, expected }, index) => {
    test(`Test ${index + 1}: Correctly processes HTML to escaped JS string`, () => {
      const result = htmlToEscapedJsString(input)
      expect(result).toBe(expected)
    })
  })
})

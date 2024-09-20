import { markdownToHtml } from '.'

describe('markdownToHtml', () => {
  it('should convert an escaped javascript markdown string to HTML', async () => {
    const markdown = `## Important Notice\n\nThe content provided is an AI-generated summary\n\n- Email: nick@awellhealth.com\n- Phone number: +32476581696`

    const expectedHtml = `<h2>Important Notice</h2>
<p>The content provided is an AI-generated summary</p>
<ul>
<li>Email: <a href="mailto:nick@awellhealth.com">nick@awellhealth.com</a></li>
<li>Phone number: +32476581696</li>
</ul>`

    const result = await markdownToHtml(markdown)

    expect(result.trim()).toBe(expectedHtml.trim())
  })

  it('should handle empty markdown input', async () => {
    const markdown = ``
    const expectedHtml = ``

    const result = await markdownToHtml(markdown)

    expect(result.trim()).toBe(expectedHtml.trim())
  })

  it('should handle markdown with no special formatting', async () => {
    const markdown = `Plain text without any markdown formatting`
    const expectedHtml = `<p>Plain text without any markdown formatting</p>`

    const result = await markdownToHtml(markdown)

    expect(result.trim()).toBe(expectedHtml.trim())
  })
})

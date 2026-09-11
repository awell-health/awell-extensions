# Mailgun changelog

## Unreleased

- "Send email": added optional file attachment support via three new fields: attachment content (base64), attachment filename, and attachment content type (defaults to `application/pdf`). Designed to attach the `base64Pdf` output of the Transform "HTML to PDF" action. Existing care flows are unaffected when the new fields are left empty.

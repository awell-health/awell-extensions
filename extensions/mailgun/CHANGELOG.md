# Mailgun changelog

## Unreleased

- "Send email with template": added the same optional file attachment support as "Send email" (attachment content (base64), attachment filename, attachment content type). The attachment validation and builder now live in a shared module used by both actions. Existing care flows are unaffected when the new fields are left empty.
- "Send email": added optional file attachment support via three new fields: attachment content (base64), attachment filename, and attachment content type (defaults to `application/pdf`). Designed to attach the `base64Pdf` output of the Transform "HTML to PDF" action. Existing care flows are unaffected when the new fields are left empty.

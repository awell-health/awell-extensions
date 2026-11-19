# Infobip changelog

## Unreleased

- "Send email": now stores Infobip's `bulkId`, `messageId` and `messageStatus` as data points and writes them to the activity log, so a sent email can be traced in Infobip's logs. No change to inputs.
- "Send email": added optional file attachment support via three new fields: attachment content (base64), attachment filename, and attachment content type (defaults to `application/pdf`). Designed to attach the `base64Pdf` output of the Transform "HTML to PDF" action. Existing care flows are unaffected when the new fields are left empty.

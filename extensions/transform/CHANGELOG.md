# Transform changelog

## Unreleased

- Fixed "HTML to PDF" ignoring the Options field. Awell delivers JSON fields as a string; the action now parses it before forwarding to the PDF server, so page format, margins, and header/footer settings take effect. Invalid JSON in Options now fails the activity with a clear validation message instead of being silently ignored.

## June 2024

- Added "Feet and inches to inches" action
## March 2024

- Added "Generate dynamic URL" action

## January 2024

- Added "Parse number to text with dictionary" action
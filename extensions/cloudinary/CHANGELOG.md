# Cloudinary changelog

## October 2023

- Action added: Upload a single file

## Unreleased

- Action added: "Upload file from data point". Stores a base64 file (e.g. the HTML to PDF `base64Pdf` output) as a private raw asset and returns a signed, expiring download link plus the asset's public ID.
- Action added: "Delete file". Deletes a private raw asset by public ID, for retention control.
- Settings added (optional): "API key" and "API secret", required only by the two new server-side actions. Existing hosted-pages upload actions are unchanged.

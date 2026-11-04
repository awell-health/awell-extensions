---
title: Cloudinary
description: Cloudinary is a cloud-based image and video management platform that provides a comprehensive set of tools for storing, managing, and delivering digital media assets. 
---
# Cloudinary

Cloudinary is a cloud-based image and video management platform that provides a comprehensive set of tools for storing, managing, and delivering digital media assets. It enables users to upload, manipulate, optimize, and deliver media files to any device or website quickly and easily.

The platform offers features such as image and video transformation, automatic image optimization, and responsive image delivery. Cloudinary also provides tools for organizing media assets, including tags, folders, and metadata.

## Set up

To set up this extension and allow image upload you will need to:

1. Have a Cloudinary account and know your cloud name
2. Created an upload preset that allows for **unsigned uploads**

The server-side actions ("Upload file from data point" and "Delete file") additionally require your Cloudinary **API key** and **API secret** (Settings > Access keys in the Cloudinary console). Tenants that only use the hosted-pages upload actions can leave these empty.

## Custom Actions

### Upload single file

Allows a user to upload a single file using Awell Hosted Pages (all file types allowed). The URL of the uploaded file is returned as a data point.
### Upload files

This action allows a given stakeholder to upload one or many files using Awell Hosted Pages (all file types allowed). This action currently doesn't return the URLs of the uploaded files. If you need this functionality, please use the "Upload single file" action for now.

### Upload file from data point

Stores a base64-encoded file that already exists as a data point, typically the `base64Pdf` output of the Transform extension's "HTML to PDF" action, as a **private raw asset** in Cloudinary and returns a signed, time-limited download link.

**Inputs:**

- **File content (base64)** (required): the base64 string. A `data:...;base64,` prefix is tolerated.
- **Filename** (required): including extension, e.g. `Health-Snapshot.pdf`. Used as the download filename. Do not include personal information.
- **Content type** (optional): MIME type, defaults to `application/pdf`.
- **Download link expiry (hours)** (optional): 1 to 168, defaults to 24.
- **Folder** (optional): overrides the folder from the extension settings.

**Data points:** `fileUrl` (signed download link), `publicId` (needed to delete the file later), `linkExpiresAt`.

**Privacy notes:** the asset is stored with a random public ID and no tags or metadata, under the `private` delivery type, so the original is only reachable through a signed link. Expiry of the link does **not** delete the file; schedule the "Delete file" action when the file is no longer needed. Files are limited to 10 MB.

### Delete file

Permanently deletes a private raw asset by public ID. Intended to be paired with "Upload file from data point" for retention control. Deleting an asset that is already gone completes successfully.

# Cloudinary

Cloudinary is a cloud-based image and video management platform that provides a comprehensive set of tools for storing, managing, and delivering digital media assets. It enables users to upload, manipulate, optimize, and deliver media files to any device or website quickly and easily.

The platform offers features such as image and video transformation, automatic image optimization, and responsive image delivery. Cloudinary also provides tools for organizing media assets, including tags, folders, and metadata.

## Custom Actions

### Upload files

This action allows a given stakeholder to upload one or many files (all file types allowed). Additionally, you can specify in what folder you would like to upload the assets.

**Prerequisites:**

1. You have a Cloudinary account
2. You have created an upload preset that allows for unsigned uploads

**Limitations:**

- You cannot manage or browse uploaded file(s) in Awell. You can only do that in Cloudinary. To make searching files as easy as possible, you can assign tags to uploaded files and each uploaded file automatically has metadata attached (pathway id and activity id)
- Only support for unsigned uploads
- As a user, you cannot delete files you already uploaded

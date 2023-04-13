# Cloudinary

Cloudinary is a cloud-based image and video management platform that provides a comprehensive set of tools for storing, managing, and delivering digital media assets. It enables users to upload, manipulate, optimize, and deliver media files to any device or website quickly and easily.

The platform offers features such as image and video transformation, automatic image optimization, and responsive image delivery. Cloudinary also provides tools for organizing media assets, including tags, folders, and metadata.

## Custom Actions

### Upload files

This action allows a given stakeholder to upload one or many files (all file types allowed).

**Prerequisites:**

- You have a Cloudinary account
- You have created an upload preset that allows for unsigned uploads

**Limitations:**
Currently, the URL(s) of the uploaded file(s) are not sent back to Awell. In order to make sure you can easily retrieve the files a stakeholder uploaded, all uploaded files will have the following context fields: `patientId`, `activityId`, and `pathwayId`. Additionally, you have the ability to add tags to files as well.

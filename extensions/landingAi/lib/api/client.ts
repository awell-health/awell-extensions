import axios, { type AxiosResponse, type AxiosInstance } from 'axios'
import FormData from 'form-data'
import { type Readable } from 'stream'
import {
  type AgenticDocumentAnalysisInputType,
  type AgenticDocumentAnalysisResponseType,
} from './schema'
import { isNil } from 'lodash'

export class LandingAiApiClient {
  private readonly client: AxiosInstance

  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async agenticDocumentAnalysis({
    input,
    mode,
  }: {
    input: AgenticDocumentAnalysisInputType
    mode: 'remoteFile' | 'base64EncodedFile'
  }): Promise<AxiosResponse<AgenticDocumentAnalysisResponseType>> {
    const form = new FormData()

    /**
     * Their API currently doesn't support a reference to a file URL,
     * so we need to download the file and append it to the form
     */
    if (mode === 'remoteFile') {
      if (!isNil(input.body.pdf)) {
        const fileRes = await axios.get<Readable>(input.body.pdf, {
          responseType: 'stream',
        })
        form.append('pdf', fileRes.data, {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        })
      } else if (!isNil(input.body.image)) {
        const fileRes = await axios.get<Readable>(input.body.image, {
          responseType: 'stream',
        })
        form.append('image', fileRes.data, {
          filename: 'document.png',
          contentType: 'image/png',
        })
      } else {
        throw new Error('Must provide either image or pdf file URL.')
      }
    } else if (mode === 'base64EncodedFile') {
      if (!isNil(input.body.pdf)) {
        const base64PdfToBuffer = Buffer.from(
          input.body.pdf.replace(/^data:.*;base64,/, ''),
          'base64',
        )

        form.append('pdf', base64PdfToBuffer, {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        })
      } else if (!isNil(input.body.image)) {
        const base64ImageToBuffer = Buffer.from(
          input.body.image.replace(/^data:.*;base64,/, ''),
          'base64',
        )

        form.append('image', base64ImageToBuffer, {
          filename: 'document.png',
          contentType: 'image/png',
        })
      } else {
        throw new Error('Must provide either base64 image or pdf.')
      }
    }

    // Add remaining fields
    form.append(
      'include_marginalia',
      input.body.include_marginalia?.toString() ?? 'false',
    )
    form.append(
      'include_metadata_in_markdown',
      input.body.include_metadata_in_markdown?.toString() ?? 'false',
    )
    if (!isNil(input.body.fields_schema)) {
      form.append('fields_schema', input.body.fields_schema)
    }

    const queryParams = new URLSearchParams()
    if (!isNil(input.query?.pages)) {
      queryParams.set('pages', input.query.pages)
    }
    if (!isNil(input.query?.timeout)) {
      queryParams.set('timeout', input.query.timeout.toString())
    }

    const response =
      await this.client.post<AgenticDocumentAnalysisResponseType>(
        `/v1/tools/agentic-document-analysis?${queryParams.toString()}`,
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        },
      )

    return response
  }
}

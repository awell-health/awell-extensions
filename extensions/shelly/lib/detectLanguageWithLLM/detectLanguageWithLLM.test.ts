import 'dotenv/config'
import { detectLanguageWithLLM } from './detectLanguageWithLLM'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessageChunk } from '@langchain/core/messages'

describe('detectLanguageWithLLM', () => {
  let mockModel: jest.Mocked<ChatOpenAI>

  beforeEach(() => {
    mockModel = {
      invoke: jest.fn(),
    } as unknown as jest.Mocked<ChatOpenAI>
  })

  it('should detect English text correctly', async () => {
    const mockLanguage = 'English'
    mockModel.invoke.mockResolvedValueOnce(
      new AIMessageChunk(mockLanguage)
    )

    const text = 'Hello world! This is a sample text in English.'
    const metadata = {
      activity_id: 'test-activity-id',
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }

    const language = await detectLanguageWithLLM({
      model: mockModel,
      text,
      metadata
    })

    expect(language).toBe(mockLanguage)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)
    expect(mockModel.invoke).toHaveBeenCalledWith(
      expect.anything(),
      { metadata, runName: 'ShellyDetectLanguage' }
    )
  })

  it('should detect Croatian text correctly', async () => {
    const mockLanguage = 'Croatian'
    mockModel.invoke.mockResolvedValueOnce(
      new AIMessageChunk(mockLanguage)
    )

    const text = 'Dobar dan! Ovo je primjer teksta na hrvatskom jeziku.'
    const metadata = {
      activity_id: 'test-activity-id',
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }

    const language = await detectLanguageWithLLM({
      model: mockModel,
      text,
      metadata
    })

    expect(language).toBe(mockLanguage)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)
    expect(mockModel.invoke).toHaveBeenCalledWith(
      expect.anything(),
      { metadata, runName: 'ShellyDetectLanguage' }
    )
  })

  it('should detect Spanish text correctly', async () => {
    const mockLanguage = 'Spanish'
    mockModel.invoke.mockResolvedValueOnce(
      new AIMessageChunk(mockLanguage)
    )

    const text = '¡Hola mundo! Este es un ejemplo de texto en español.'
    const metadata = {
      activity_id: 'test-activity-id',
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }

    const language = await detectLanguageWithLLM({
      model: mockModel,
      text,
      metadata
    })

    expect(language).toBe(mockLanguage)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)
    expect(mockModel.invoke).toHaveBeenCalledWith(
      expect.anything(),
      { metadata, runName: 'ShellyDetectLanguage' }
    )
  })

  it('should handle empty text gracefully', async () => {
    const mockLanguage = 'Unknown'
    mockModel.invoke.mockResolvedValueOnce(
      new AIMessageChunk(mockLanguage)
    )

    const text = ''
    const metadata = {
      activity_id: 'test-activity-id',
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }

    const language = await detectLanguageWithLLM({
      model: mockModel,
      text,
      metadata
    })

    expect(language).toBe(mockLanguage)
    expect(mockModel.invoke).toHaveBeenCalledTimes(1)
  })

  it('should handle errors gracefully', async () => {
    mockModel.invoke.mockRejectedValueOnce(new Error('API Error'))

    const text = 'Hello world'
    const metadata = {
      activity_id: 'test-activity-id',
      care_flow_definition_id: 'test-def-id',
      care_flow_id: 'test-pathway-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id'
    }

    await expect(
      detectLanguageWithLLM({
        model: mockModel,
        text,
        metadata
      })
    ).rejects.toThrow('Failed to detect language')
  })
}) 
const mockSdk = {
  uploader: {
    upload: jest.fn(async (_file: string, options: Record<string, unknown>) => ({
      public_id: String(options.public_id ?? 'mock-public-id'),
      bytes: 1234,
      resource_type: options.resource_type ?? 'raw',
      type: options.type ?? 'private',
      secure_url: 'https://res.cloudinary.com/mock/raw/private/mock-public-id',
    })),
    destroy: jest.fn(async () => ({ result: 'ok' })),
  },
  utils: {
    private_download_url: jest.fn(
      (publicId: string, _format: string, options: Record<string, unknown>) =>
        `https://api.cloudinary.com/v1_1/${String(options.cloud_name)}/raw/download?public_id=${encodeURIComponent(publicId)}&expires_at=${String(options.expires_at)}&signature=mock`,
    ),
  },
}

export default mockSdk

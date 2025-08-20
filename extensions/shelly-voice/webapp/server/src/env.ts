import dotenv from 'dotenv'
dotenv.config()

export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 5057,
  LIVEKIT_URL: process.env.LIVEKIT_URL || '',
  LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY || '',
  LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET || '',
  AWELL_WEBHOOK_URL: process.env.AWELL_WEBHOOK_URL || '',
}

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { env } from './env'
import { router } from './routes'

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '2mb' }))
app.use('/api', router)

app.listen(env.PORT, () => {
  console.log(`Shelly Voice server listening on http://localhost:${env.PORT}`)
})

export default app

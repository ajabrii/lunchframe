import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
const port = Number(process.env.PORT || 8080)

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gateway-node', version: '0.1.0' })
})

// TODO: implement /v1/auth, /v1/videos, /v1/templates, /v1/projects

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`gateway-node listening on :${port}`)
})

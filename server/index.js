import { createApp } from './app.js'
import { config } from './config.js'

const app = createApp()
app.listen(config.port, () => {
  console.log(`API OpenSlides Manager → http://localhost:${config.port} (${config.nodeEnv})`)
})

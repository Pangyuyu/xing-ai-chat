import EleGlobals from './EleGlobals'
import { join } from 'node:path'
import { BrowserWindow, shell } from 'electron'
export default {
  async showMainWindow() {
    if (EleGlobals.mainWin) {
      return
    }
    // const url = process.env.VITE_DEV_SERVER_URL
    
    // const indexHtml = join(process.env.DIST, 'index.html')

  }
}

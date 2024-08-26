import { BrowserWindow } from 'electron'
/**
 * 全局常量
 */
export default class EleGlobals {
  /**
   * 主窗体
   */
  static mainWin: BrowserWindow | null = null
  /**
   * 子窗体
   */
  static childWins: BrowserWindow[] = []
}

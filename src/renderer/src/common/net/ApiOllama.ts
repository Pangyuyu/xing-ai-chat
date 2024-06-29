/* eslint-disable @typescript-eslint/no-explicit-any */
/*ollama API 接口：
https://ollama.fan/reference/api/
https://github.com/ollama/ollama/blob/main/docs/api.md
*/
import SysConst from '@renderer/common/utils/SysConst'
import IChatCallBack from './IChatCallBack'
const DefaultHeader = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json' // 请求头
  }
}
export default class ApiOllama {
  static async listLocalModels() {
    const url = `${SysConst.OLLAMA_ENDPOINT}/api/tags`
    const res = await fetch(url, DefaultHeader)
    const data = await res.json()
    return data
  }
  static async listRunningModels() {
    const url = `${SysConst.OLLAMA_ENDPOINT}/api/ps`
    const res = await fetch(url, DefaultHeader)
    const data = await res.json()
    return data
  }
  /**
   * 补全对话
   * @param modelName 模型名称
   * @param prompt 提示词
   * @param cbChat 对话回调
   */
  static async generate(modelName: string, prompt: string, cbChat: IChatCallBack) {
    const data = {
      model: modelName,
      prompt: prompt,
      stream: true,
      options: {
        num_ctx: 4096 //上下文窗口大小
      }
    }
    const url = `${SysConst.OLLAMA_ENDPOINT}/api/generate`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // 请求头
      },
      body: JSON.stringify(data)
    })
    let doneRes: any = {}
    // 检查响应状态码以确保请求成功
    if (!response.ok) {
      cbChat.resFailed(`HTTP error! status: ${response.status}`)
      return
    }
    const reader = response?.body?.getReader()
    if (reader == null) {
      cbChat.resFailed('stream is empty')
      return
    }

    const textDecoder = new TextDecoder('utf-8')
    let doing = true
    while (doing) {
      const { done, value } = await reader.read()
      if (done) {
        cbChat.resComplate()
        doing = false
        break
      }
      // 需要将其解码为字符串
      const chunkStr = textDecoder.decode(value)
      try {
        const chunkJson = JSON.parse(chunkStr)
        if (chunkJson.done) {
          cbChat.resComplate()
          doneRes = chunkJson
          doing = false
          break
        }
        cbChat.resStream(chunkJson.response)
      } catch (ex) {
        console.warn(ex)
        cbChat.resFailed('stream is empty')
        doing = false
        break
      }
    }
    cbChat.resComplate()
    return doneRes
  }
}

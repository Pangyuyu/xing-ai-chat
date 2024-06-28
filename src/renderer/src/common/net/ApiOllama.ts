// const OLLAMA_ENDPOINT = 'http://localhost:11434'
import SysConst from '@renderer/common/utils/SysConst'
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
  static async generate(
    modelName: string,
    prompt: string,
    cbStream: (str: string) => void,
    cbFailed: (err: string) => void,
    cbComplate: () => void
  ) {
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
    // 检查响应状态码以确保请求成功
    if (!response.ok) {
      if (cbFailed) {
        cbFailed(`HTTP error! status: ${response.status}`)
      }
      return
    }

    // 创建一个 `Readable` 对象来读取流式数据，这样可以逐块处理数据而非一次性加载所有数据到内存中。
    // const stream = response.body
    // if (stream == undefined || stream == null) {
    //   console.warn('stream is emtpy')
    //   if (cbFailed) {
    //     cbFailed('stream is empty')
    //   }
    //   return
    // }
    // const textDecoder = new TextDecoder() // 创建解码器
    // for await (const chunk of stream) {
    //   const str = textDecoder.decode(chunk) // 利用解码器把数据解析成字符串
    //   if (cbStream) {
    //     cbStream(str)
    //   }
    // }
    const reader = response?.body?.getReader();
    if (reader == null) {
      if (cbFailed) {
        cbFailed('stream is empty')
      }
      return
    }
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        if (cbComplate) {
          cbComplate()
        }
        break
      }
      // 假设是文本数据，需要将其解码为字符串
      const chunkStr = new TextDecoder().decode(value)
      const chunkJson = JSON.parse(chunkStr)
      if (chunkJson.done) {
        if (cbComplate) {
          cbComplate()
        }
        break
      }
      if (cbStream) {
        console.log("response",chunkJson.response)
        cbStream(chunkJson.response)
      }
    }
    if (cbComplate) {
      cbComplate()
    }
  }
}

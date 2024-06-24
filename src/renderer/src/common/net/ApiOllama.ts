const OLLAMA_ENDPOINT = 'http://localhost:11434'
export default class ApiOllama {
  static async listLocalModels() {
    const url = `${OLLAMA_ENDPOINT}/api/tags`
    const init = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json' // 请求头
      }
    }
    const res = await fetch(url, init)
    const data = await res.json()
    return data
  }
}

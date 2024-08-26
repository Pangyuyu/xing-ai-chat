<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SysConst from '@renderer/common/utils/SysConst'
import ApiOllama from '@renderer/common/net/ApiOllama'
const log = ref('')
const ollamaEndPoint = ref(SysConst.OLLAMA_ENDPOINT)
class Model {
  name = ''
  model = ''
  parameterSize = ''
  quantizationLevel = ''
  checked = false
  isRuning = false
}
onMounted(() => {
  onClickGetModels()
})
const modelList = ref<Array<Model>>([])
async function onClickGetModels() {
  const data = await ApiOllama.listLocalModels()
  log.value = data
  const tempList: Model[] = data.models.map((it) => {
    return {
      name: it.name,
      model: it.model,
      parameterSize: it.details.parameter_size,
      quantizationLevel: it.details.quantization_level,
      checked: false,
      isRuning: false
    }
  })
  tempList.sort((a: Model, b: Model) => {
    const aLastChar = a.parameterSize.charAt(a.parameterSize.length - 1)
    const bLastChar = b.parameterSize.charAt(b.parameterSize.length - 1)
    const charCompareIndex = bLastChar.localeCompare(aLastChar)
    if (charCompareIndex == 0) {
      return a.parameterSize.localeCompare(b.parameterSize)
    }
    return charCompareIndex
  })
  modelList.value = tempList.filter((it) => {
    return !it.model.includes('embed')
  })

  //获取当前正在运行的模型
  if (modelList.value.length == 0) {
    return
  }
  const runningData = await ApiOllama.listRunningModels()
  const hasRunning = runningData && runningData.models && runningData.models.length > 0
  if (!hasRunning) {
    modelList.value[0].checked = true
    return
  }
  const firstRuning = runningData.models[0]
  modelList.value.forEach((it) => {
    it.checked = it.name == firstRuning.name
  })
}
function onClickModelItem(model: Model) {
  modelList.value.forEach((it) => {
    it.checked = it.name == model.name
  })
}
const askStr = ref('')
class Chat {
  id = ``
  /**
   * 消息类型
   * A:提问
   * R:回复
   * E:异常
   * S:统计信息
   */
  type: 'A' | 'R' = 'A'
  content = ''
}
const chatList = ref<Array<Chat>>([])
function onClickSendQuestion() {
  const askContent = askStr.value
  chatList.value.push({
    id: Date.now() + '',
    type: 'A',
    content: askStr.value
  })
  askStr.value = ''
  setTimeout(() => {
    runQuestion(askContent)
  }, 100)
}
async function runQuestion(askContent: string) {
  const newLen = chatList.value.push({
    id: Date.now() + '',
    type: 'R',
    content: askStr.value
  })
  const newChat = chatList.value[newLen - 1]
  const modelActive = modelList.value.find((it) => {
    return it.checked
  })
  const modelName = modelActive ? modelActive.name : ''
  const res = await ApiOllama.generate(modelName, askContent, {
    resStream(str: string) {
      newChat.content += str
    },
    resFailed(err: string) {
      console.warn('出错啦', err)
    },
    resComplate() {
      console.warn('回答结束啦')
    }
  })
  console.log('正常结束', res)
}
const filterStr = ref('')
function filterModel(model: Model) {
  if (filterStr.value || filterStr.value.length > 0) {
    const lowerStr = filterStr.value.toLowerCase()
    return (
      model.model.toLowerCase().startsWith(lowerStr) ||
      model.parameterSize.toLowerCase().startsWith(lowerStr)
    )
  }
  return true
}
function onAskEnter() {
  onClickSendQuestion()
}
</script>

<template>
  <div class="page">
    <div class="left">
      <div class="attr-item">
        <div class="caption">Ollama</div>
        <div class="value">
          <div class="btn" @click="onClickGetModels()">获取模型</div>
        </div>
      </div>
      <div class="attr-item">
        <div class="caption">API</div>
        <div class="value">
          {{ ollamaEndPoint }}
        </div>
      </div>
      <div class="attr-item">
        <div class="caption">模型列表</div>
        <div class="value">
          <input v-model="filterStr" class="filter" />
        </div>
      </div>
      <div class="model-list">
        <template v-for="model in modelList" :key="model.name">
          <div v-if="filterModel(model)" class="model-item" :class="model.checked ? 'model-item-active' : ''"
            @click="onClickModelItem(model)">
            <div class="name">{{ model.name }}</div>
            <div class="detail">{{ model.parameterSize }} | {{ model.quantizationLevel }}</div>
          </div>
        </template>
      </div>
    </div>
    <div class="middle">
      <div class="model-state">
        <!-- <div>正在运行的模型:</div> -->
      </div>
      <div class="chat-list">
        <div v-for="chat in chatList" :key="chat.id" class="chat-item" :class="chat.type == 'A' ? 'ask' : 'reply'">
          {{ chat.content }}
        </div>
      </div>
      <div class="user-ask">
        <input v-model="askStr" class="input" placeholder="请输入您的问题" @keyup.enter="onAskEnter" />
        <div class="btn-send" @click="onClickSendQuestion()">发送</div>
      </div>
    </div>
    <div class="right"></div>
  </div>
</template>


<style>
/* 自定义滚动条的整体部分 */
::-webkit-scrollbar {
  width: 10px;
  /* 宽度 */
  height: 10px;
  /* 高度，对于垂直滚动条 */
}

/* 自定义滚动条的滑块部分 */
::-webkit-scrollbar-thumb {
  background: #888;
  /* 滑块颜色 */
  border-radius: 5px;
  /* 圆角 */
}

/* 鼠标悬停时的滑块样式 */
::-webkit-scrollbar-thumb:hover {
  background: #555;
  /* 变色效果 */
}

/* 自定义滚动条轨道 */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* 轨道颜色 */
  border-radius: 5px;
  /* 轨道圆角 */
}
</style>

<style lang="scss" scoped>
$borderColor: #575555;

.page {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  padding: 4px;
  display: flex;
  flex-direction: row;

  .left {
    width: 260px;
    min-width: 260px;
    border-right: 1px solid $borderColor;
    display: flex;
    flex-direction: column;

    .attr-item {
      display: flex;
      height: 45px;
      align-items: center;
      border-bottom: 1px solid $borderColor;
      font-size: 14px;

      .caption {
        width: 60px;
        text-align: right;
      }

      .value {
        flex-grow: 1;
        display: flex;
        align-items: center;
        padding-left: 8px;
      }

      .btn {
        width: 100%;
        margin-left: 10px;
        margin-right: 10px;
        height: 32px;
        border-radius: 10px;
        color: white;
        border: 1px solid $borderColor;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn:hover {
        background-color: rgba(82, 123, 193, 0.6);
      }

      .btn:active {
        background-color: rgba(82, 123, 193, 0.8);
      }

      .filter {
        width: 100%;
        margin-left: 10px;
        margin-right: 10px;
        height: 26px;
        border-radius: 10px;
        border: 1px solid $borderColor;
        text-align: center;
      }
    }

    .model-list {
      flex-grow: 1;
      height: 0;
      overflow-y: auto;

      .model-item {
        height: 60px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border-bottom: 1px solid $borderColor;
        cursor: pointer;

        .name {
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .detail {
          font-size: 12px;
          color: #c3c6cc;
        }
      }

      .model-item-active {
        background-color: rgba(#338bf7, 0.6);
      }
    }
  }

  .middle {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    height: 100%;

    .model-state {
      display: flex;
      height: 45px;
      align-items: center;
      border-bottom: 1px solid $borderColor;
      font-size: 14px;
      padding-left: 10px;
      padding-right: 10px;
    }

    .chat-list {
      flex-grow: 1;
      width: 100%;
      height: 0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      border-top: 1px solid $borderColor;
      border-bottom: 1px solid $borderColor;

      .chat-item {
        white-space: pre-wrap;
        background-color: transparent;
        border: none;
      }

      .ask {
        color: #b3b0f1;
        padding-left: 10px;
        margin-bottom: 10px;
        white-space: pre-wrap;
      }

      .reply {
        color: #e8eaf1;
        padding-left: 10px;
        margin-bottom: 20px;
        border-bottom: 1px solid $borderColor;
        padding-bottom: 10px;
        line-height: 18px;
        font-size: 14px;
        font-family: '行书';
      }
    }

    .user-ask {
      height: 100px;
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;

      .input {
        flex-grow: 1;
        height: 55px;
        margin-left: 10px;
        margin-right: 10px;
        font-size: 16px;
        border-radius: 10px;
        padding-left: 6px;
        padding-right: 6px;
      }

      .btn-send {
        background-color: #338bf7;
        width: 160px;
        height: 55px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        font-size: 22px;
      }
    }
  }

  .right {
    width: 320px;
    min-width: 320px;
    border-left: 1px solid $borderColor;
  }

  .log {
    flex-grow: 1;
    background-color: black;
    color: white;
    font-size: 12px;
    border: 1px solid #ffffff;
    height: 0px;
    overflow-y: auto;
  }
}
</style>
: { name: any; model: any; details: { parameter_size: any; quantization_level: any; }; }: any: any

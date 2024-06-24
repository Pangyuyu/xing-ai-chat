<script setup lang="ts">
import { ref } from 'vue'
import ApiOllama from '@renderer/common/net/ApiOllama'
const log = ref('')
async function onClickApiTest() {
  const data = await ApiOllama.listLocalModels()
  log.value = data
}
</script>

<template>
  <div class="page">
    <pre class="log"><code>
        {{log}}
    </code></pre>
    <div class="actions">
      <div class="btn" @click="onClickApiTest()">API测试：获取ollama模型列表</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  padding: 4px;
  display: flex;
  flex-direction: column;

  .actions {
    display: flex;
    height: 90px;
    flex-direction: row;
    align-items: center;
    width: 100%;
    background-color: azure;

    .btn {
      width: auto;
      height: 55px;
      background-color: #20a9f3;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
    }
  }

  .btn:hover {
    background-color: #09a1f3;
    cursor: pointer;
  }

  .btn:active {
    background-color: #0984c7;
    cursor: pointer;
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

<template>
  <div style="padding: 40px; max-width: 1200px; margin: 0 auto; position: relative;">
    <el-tooltip
        effect="dark"
        content="关于"
        placement="bottom"
    >
      <el-button
          circle
          @click="showDialog = true"
          style="position: absolute; top: 10px; right: 10px; background-color: #afaeae"
      >?</el-button>
    </el-tooltip>


    <h1 style="text-align: center; margin-bottom: 30px;">请选择一个题库游玩</h1>

    <div class="image-grid">
      <div
          v-for="item in games"
          :key="item.title"
          class="image-item"
          @click="goTo(item.prop)"
      >
        <el-popover
            class="box-item"
            :title="item.title"
            :content="item.description"
            placement="bottom-start"
        >
          <template #reference>
            <img :src="item.pic_url" class="grid-image" />
          </template>
        </el-popover>
      </div>
    </div>

    <el-dialog v-model="showDialog" title="关于" width="1200px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础规则说明" name="rule">
          <div v-html="renderedRule" class="markdown-body" />
        </el-tab-pane>
        <el-tab-pane label="如何创建题库" name="dataset">
          <div v-html="renderedDataset" class="markdown-body" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { games } from '../datas/games.js'
import { marked } from 'marked'
import {onMounted, ref} from "vue";

const router = useRouter();
const activeTab = ref('rule');

const goTo = (type) => {
  router.push(`/guess/${type}`)
}

const showDialog = ref(false);
const renderedRule = ref('');
const renderedDataset = ref('');


onMounted(async () => {
  const [rule, dataset] = await Promise.all([
    fetch(new URL('../assets/rule.md', import.meta.url)),
    fetch(new URL('../assets/dataset.md', import.meta.url)),
  ])
  renderedRule.value = marked.parse(await rule.text());
  renderedDataset.value = marked.parse(await dataset.text());
});
</script>


<style scoped>

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 50px;
}

.image-item {
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
}

.image-item:hover {
  transform: scale(1.05);
}

.grid-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 22px;
  border: 1px solid black;
}

.markdown-body {
  font-size: 20px;
  line-height: 1.6;
}
</style>
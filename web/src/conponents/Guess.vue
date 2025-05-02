<template>
  <div>
    <div style="position: relative; padding: 20px;">
      <div style="position: absolute; left: 0; top: 10%; transform: translateY(-50%);">
        <el-button style="background-color: grey; color: white; font-size: 20px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2)"
                   :icon="ArrowLeft" @click="goBack" />
      </div>
      <div style="padding: 20px; display: flex; justify-content: center; align-items: center; margin-top: 20px;">
        <el-button :class="{'my-green-button': isInfiniteStep === true,
                           'my-grey-button': isInfiniteStep === false}"
                   type="primary"
                   @click="isInfiniteStep = true; maxSteps='∞'">无限次数</el-button>
        <span style="margin-left: 10px; margin-right: 10px; font-size: 16px; font-weight: bold">猜测次数：{{step}} / {{maxSteps}}</span>
        <el-autocomplete
            v-model="searchInput"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            clearable
            :placeholder="placeholder"
            style="width: 300px; margin-right: 10px"
            @keydown.enter="inputValue"
        />
        <el-button type="primary" @click="inputValue" :disabled="isGameOver">确认</el-button>
        <el-button class="my-green-button" type="primary" @click="restart">重新开始</el-button>
        <el-button class="my-red-button" type="primary" :disabled="isGameOver" @click="getAnswer">揭晓答案</el-button>
      </div>
      <el-tooltip
          effect="dark"
          content="关于"
          placement="bottom"
      >
        <el-button
            circle
            @click="showAboutDialog = true"
            style="position: absolute; top: 10px; right: 10px; background-color: #afaeae"
        >?</el-button>
      </el-tooltip>
    </div>

  <el-dialog
      v-model="overDialogVisible"
      title="游戏结束"
      width="500"
  >
    <div style="display: flex; align-items: flex-start;">
      <img :src="goal.pic_url" style="width: 180px; height: auto; margin-right: 20px;" alt="" v-if="hasPic"/>

      <div>
        <span v-if="gameSuccess === 'success'">猜对了！您使用了{{step}}次猜中！</span>
        <span v-else-if="gameSuccess === 'fail'">猜错了！正确答案是：</span>
        <span v-else>正确答案是：</span>
        <div v-for="(value, key) in filterGoal(goal)" :key="key" style="margin-bottom: 4px;">
          <span style="font-weight: bold;">{{ prop2label[key] }}:</span>
          <span style="margin-left: 6px;">
            {{ Array.isArray(value) ? value.join(', ') : value }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="overDialogVisible = false">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>

    <el-dialog v-model="showAboutDialog" title="关于" width="1200px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="规则说明" name="rule">
          <div v-html="renderedRule" class="markdown-body" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

  <el-table
      :data="resultList"
      style="margin-top: 20px; width: 100%; height: 100%; overflow: auto;"
      :empty-text="''"
      :row-class-name="tableRowClassName"
  >
    <el-table-column prop="pic_url" label="" v-if="hasPic" align="center">
      <template v-slot="scope">
        <img :src="scope.row['pic_url'].value" style="width: 100px; height: 100px;" alt=""/>
      </template>
    </el-table-column>
    <el-table-column
      v-for="col in columns.filter(c => c.type !== 'hide')"
      :key="col.prop"
      :label="col.label"
      :prop="col.prop"
      align="center"
    >
      <template v-slot="scope">
        <template v-if="col.type === 'key'">
          <span class="guess_text">{{ scope.row[scope.column.property].value }}</span>
        </template>
        <template v-else-if="Array.isArray(scope.row[scope.column.property].value)">
          <div class="flex gap-2 flex-wrap">
            <span
                v-for="(item, index) in scope.row[scope.column.property].value"
                :key="index"
                :class="{ 'guess_text guess_true': scope.row[scope.column.property].correct[index] === 'correct',
           'guess_text guess_false': scope.row[scope.column.property].correct[index] === 'false',
           'guess_text guess_near': scope.row[scope.column.property].correct[index] === 'near'}"
            >
              {{ item }}
            </span>
          </div>
        </template>
        <template v-else-if="scope.row[scope.column.property].value === ''"></template>
        <template v-else>
          <span :class="{ 'guess_text guess_true': scope.row[scope.column.property].correct === 'correct',
           'guess_text guess_false': scope.row[scope.column.property].correct === 'false',
           'guess_text guess_near': scope.row[scope.column.property].correct === 'near'}">
            {{ scope.row[scope.column.property].value }}
          </span>
        </template>
      </template>
    </el-table-column>
  </el-table>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {ElMessage} from "element-plus";
import router from "../../router/index.js";
import {useRoute} from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue"
import {marked} from "marked";

const modules = import.meta.glob("../datas/*.js")

let mainData = []
let columns = []
let maxStep = 0
let prop2label = []
let placeholder = ""
let hasPic = true

const maxSteps = ref('');
const isInfiniteStep = ref(false);
const overDialogVisible = ref(false);
const gameSuccess = ref();
const isGameOver = ref();
const searchInput = ref('');
const resultList = ref([]);
const showAboutDialog = ref(false);
const activeTab = ref('rule');
const renderedRule = ref('');
let dataProcessor;
let goal;
let step;

const tableRowClassName = ({ row }) => {
  if (row.correct === 'correct') {
    return 'row-success';
  } else if (row.correct === 'fail') {
    return 'row-fail';
  }
  return 'row-normal';
}

const restart = () => {
  start();
}

const goBack = () => {
  router.push('/');
}

const getAnswer = () => {
  isGameOver.value = true;
  overDialogVisible.value = true;
  insertGoal2Table();
}

const filterGoal = (goal) => {
  return Object.fromEntries(
      Object.entries(goal).filter(([key, value]) => key !== "pic_url" && value != null && value !== "")
  );
}

const route = useRoute()

const loadData = async () => {
  console.log("加载数据中")
  try {
    const module = await modules[`../datas/${route.params.type}.js`]();
    mainData = module.mainData;
    columns = module.columns;
    dataProcessor = new module.MyDataProcessor(mainData, columns);
    maxStep = module.maxStep;
    prop2label = module.prop2label;
    hasPic = module.hasPic;
    placeholder = module.placeholder;
    renderedRule.value = marked.parse(module.rule);

    start();
  } catch(err) {
    console.error(`加载${route.params.type}数据失败:`, err);
    await router.push('/');
  }
}

const start = () => {
  console.log("开始游戏")
  console.log(dataProcessor)
  goal = dataProcessor._selectGoal();
  console.log(goal);
  resultList.value = [];
  step = 0;
  isGameOver.value = false;
  overDialogVisible.value = false;
  gameSuccess.value = "";
  maxSteps.value = maxStep.toString();
  isInfiniteStep.value = false;
  searchInput.value = '';
}


const insertGoal2Table = () => {
  const item = dataProcessor.restructureData(goal);
  item['correct'] = 'fail'
  resultList.value.unshift(item);
}

const inputValue = () => {
  let item = dataProcessor.input2Labels(searchInput.value);
  if (!item) {
    ElMessage.error('未找到');
    return;
  }
  item = dataProcessor.restructureData(item);
  resultList.value.unshift(item);
  step++;
  if (searchInput.value === goal.value) {
    gameSuccess.value = "success";
    overDialogVisible.value = true;
    isGameOver.value = true;
  } else {
    console.log(isInfiniteStep)
    if (step >= maxStep && !isInfiniteStep.value) {
      gameSuccess.value = "fail";
      overDialogVisible.value = true;
      isGameOver.value = true;
      insertGoal2Table();
    }
  }
  searchInput.value = "";
};

const querySearch = (queryString, cb) => {
  cb(dataProcessor.autoComplete(queryString));
};

onMounted(() => {
  loadData();
})
</script>

<style>

.guess_false {
  background-color: #a6a3a3;
  color: #514f4f;
}

.guess_true {
  background-color: #17da17;
  color: #0a7c0a;
}
.guess_near {
  background-color: #ffcc3d;
  color: #ec910c;
}

.guess_text {
  padding: 4px 8px;
  margin-right: 6px;
  margin-bottom: 6px;
  border-radius: 6px;
  font-size: 16px;
  text-align: center;
  display: inline-block;
}

.my-green-button {
  background-color: green;
  color: white;
  border: none;
}

.my-green-button:hover {
  background-color: #228B22;
}

.my-grey-button {
  background-color: grey;
  color: white;
  border: none;
}

.my-grey-button:hover {
  background-color: #6c6c6c;
}

.my-red-button {
  background-color: #c10606;
  color: white;
  border: none;
}

.my-red-button:disabled {
  background-color: rgba(193, 6, 6, 0.65);
  color: white;
  border: none;
}

.my-red-button:hover {
  background-color: #d30707;
}

.my-red-button:disabled:hover {
  background-color: rgba(193, 6, 6, 0.65);
}

/*noinspection ALL*/
.row-normal {
  background-color: #f0f9eb;
}

/*noinspection ALL*/
.row-success {
  background-color: rgba(157, 246, 157, 0.63) !important;
}

/*noinspection ALL*/
.row-fail {
  background-color: rgba(241, 123, 123, 0.45) !important;
}
</style>

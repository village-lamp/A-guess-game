<template>
  <div style="padding: 20px; display: flex; justify-content: center; align-items: center; margin-top: 20px;">
    <span style="margin-right: 10px; font-size: 16px; font-weight: bold">猜测次数：{{step}} / {{maxStep}}</span>
    <el-autocomplete
        v-model="searchInput"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="false"
        clearable
        placeholder="请输入精灵名称"
        style="width: 300px; margin-right: 10px"
    />
    <el-button type="primary" @click="inputValue" :disabled="isInputDisable">确认</el-button>
    <el-button class="my-green-button" type="primary" @click="restart">重新开始</el-button>
  </div>

  <el-dialog
      v-model="overDialogVisible"
      title="游戏结束"
      width="500"
  >
    <div style="display: flex; align-items: flex-start;">
      <img :src="goal.pic_url" style="width: 180px; height: auto; margin-right: 20px;" alt=""/>

      <div>
        <span v-if="gameSuccess">猜对了！</span>
        <span v-else>猜错了！正确答案是：</span>
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

  <el-table
      :data="resultList"
      style="margin-top: 20px; width: 100%; height: 100%; overflow: auto;"
      :empty-text="''"
  >
    <el-table-column prop="pic_url" label="">
      <template v-slot="scope">
        <img :src="scope.row['pic_url'].value" style="width: 100px; height: 100px;"/>
      </template>
    </el-table-column>
    <el-table-column
      v-for="col in columns.filter(c => c.type !== 'hide')"
      :key="col.prop"
      :label="col.label"
      :prop="col.prop"
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { mainData, columns, maxStep, prop2label } from './data.js';
import {ElMessage} from "element-plus";

const overDialogVisible = ref();
const gameSuccess = ref();
const isInputDisable = ref();
const searchInput = ref('');
const resultList = ref([]);
let goal;
let step;

const restart = () => {
  start();
}

const filterGoal = (goal) => {
  return Object.fromEntries(
      Object.entries(goal).filter(([key, value]) => key !== "pic_url" && value != null && value !== "")
  );
}

const start = () => {
  goal = mainData[Math.floor(Math.random() * mainData.length)];
  console.log(goal);
  resultList.value = [];
  step = 0;
  isInputDisable.value = false;
  overDialogVisible.value = false;
  gameSuccess.value = false;
}

const restructureData = (item) => {
  const result = {};
  result["pic_url"] = {"value": item.pic_url};
  for (const column of columns) {
    const key = column.prop;
    const column_result = {};
    if (column.type === "normal_list") {
      column_result.value = item[key];
      const correct = [];
      for (const i of item[key]) {
        correct.push(goal[key].includes(i) ? 'correct' : 'false');
      }
      column_result.correct = correct;
    } else if (column.type === "key" || column.type === "pic") {
      column_result.value = item[key];
    } else if (column.type === "num") {
      const target = parseInt(goal[key]);
      const current = parseInt(item[key]);
      const appendix = target > current ? '↑':
          target < current ? '↓': '';
      column_result.value = item[key] + appendix;
      column_result.correct = target === current ? 'correct'
          : Math.abs(target - current) <= parseInt(column.near) ? 'near'
          : 'false';
    } else if (column.type === "normal") {
      column_result.value = item[key];
      column_result.correct = item[key] === goal[key] ? 'correct' : 'false';
    }
    result[key] = column_result;
  }
  console.log(result);
  return result;
}

const inputValue = () => {
  const item = restructureData(mainData.find(d => d.value === searchInput.value));
  if (item) {
    resultList.value.push(item);
  } else {
    ElMessage.error('未找到该精灵');
  }
  step++;
  if (searchInput.value === goal.value) {
    console.log(searchInput.value)
    gameSuccess.value = true;
    overDialogVisible.value = true;
    isInputDisable.value = true;
  } else {
    if (step >= maxStep) {
      gameSuccess.value = false;
      overDialogVisible.value = true;
      isInputDisable.value = true;
    }
  }
  searchInput.value = "";
};

const restaurants = ref([]);

const createFilter = (queryString) => {
  return (restaurant) => {
    return restaurant.value.toLowerCase().includes(queryString.toLowerCase());
  };
};

const querySearch = (queryString, cb) => {
  const results = queryString
      ? restaurants.value.filter(createFilter(queryString))
          .sort((a, b) => {
            const indexA = a.value.toLowerCase().indexOf(queryString.toLowerCase());
            const indexB = b.value.toLowerCase().indexOf(queryString.toLowerCase());
            return indexA - indexB;
          })
      : restaurants.value;
  cb(results);
};

onMounted(() => {
  restaurants.value = mainData
  start();
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
</style>

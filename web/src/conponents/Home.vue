<template>
  <div style="padding: 40px; max-width: 1200px; margin: 0 auto">
    <h1 style="text-align: center; margin-bottom: 30px;">请选择一个项目游玩</h1>

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
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { games } from '../games.js'

const router = useRouter()

const goTo = (type) => {
  router.push(`/guess/${type}`)
}
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
  border-radius: 16px;
}
</style>
<template>
  <div>
    <div
      v-for="point, i in points"
      :key="i" 
      class="point"
      :style="{ 
        left: point.x + 'rem', 
        top: point.y + 'rem', 
        marginLeft: 2*radius + 'rem', 
        marginTop: 2*radius + 'rem',
        zIndex: i % 2,
        backgroundColor: i % 2 === 0 ? '#0000ffd0' : '#00ff00d0',
      }"
    >
      {{ i }}
    </div>
  </div>
</template>

<style scoped>
.point {
  position: absolute;
  font-size: 200%;
  color: white;
  border-radius: 1rem;
}
</style>

<script setup lang="ts">
const points: any[] = []
const radius = 10
for (let i = 0; i < 2 * Math.PI; i += 0.2) {
  const x = radius * Math.cos(i)
  const y = -radius * Math.sin(i)
  points.push({ x, y })
}
</script>
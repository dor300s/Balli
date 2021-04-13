<template>
  <div class="level-details-container">
    <div class="current-level">Level: {{ getLevel }}</div>
    <button @click="resetGame">Reset</button>
    <button @click="onOpenLevelsModal">Levels</button>
  </div>
</template>

<script>
export default {
  name: 'LevelDetails',
  props: ['getLevel', 'resetGame', 'onOpenLevelsModal']
}
</script>
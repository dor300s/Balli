<template>
  <transition name="scale">
    <div
      ref="levelModal"
      v-show="isLevelModalOpen"
      class="level-modal-container flex column align-center justify-center"
    >
      <h3>levels</h3>
      <div class="levels-wrapper flex">
        <div
          v-for="stage in unlockedStages"
          :key="stage.level"
          class="level"
          @click="() => onSelectLevel(stage.level)"
        >
          {{ stage.level }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'LevelsModal',
  props: ['isLevelModalOpen', 'unlockedStages', 'onSelectLevel', 'onCloseLevelsModal'],
  methods: {
    handleClick(e) {
      if (!this.isLevelModalOpen) return;
      if (!this.$refs.levelModal.contains(e.target)) this.onCloseLevelsModal();
    }
  },
  mounted() {
    window.addEventListener('mousedown', this.handleClick);
  },
  beforeDestroy() {
    window.removeEventListener('mousedown', this.handleClick);
  }
}
</script>

<style>
</style>
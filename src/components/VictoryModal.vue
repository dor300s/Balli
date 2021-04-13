<template>
  <transition name="scale">
    <div
      class="victory-modal flex column justify-center align-center"
      v-show="isVictory"
    >
      <h2>Good Job!</h2>
      <div class="buttons-wrapper flex space-between">
        <button @click="resetGame">Reset</button>
        <button @click="onNextLevel" v-show="getLevel !== getStagesLength">
          Next Level
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'VictoryModal',
  props: ['isVictory', 'resetGame', 'onNextLevel', 'getLevel', 'getStagesLength']
}
</script>
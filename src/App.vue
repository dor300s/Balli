<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'app',
  created() {
    document.title = 'Balli';
  },
};
</script>

<style lang="scss">
@import "@/style/global.scss";
</style>

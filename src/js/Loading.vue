<template>
  <div>
    <span v-for="n in dots + 1" :key="n">.</span>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  setup() {
    const dots = ref(3);
    let interval;

    onMounted(() => interval = setInterval(() => dots.value = (dots.value + 1) % 3, 200));
    onUnmounted(() => clearInterval(interval));

    return { dots };
  }
});
</script>

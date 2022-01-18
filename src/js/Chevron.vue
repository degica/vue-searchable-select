<template>
  <svg @click="onClick" width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0.656738L11.3137 0.656738L5.65685 6.31359L0 0.656738Z" fill="#172E44"/>
  </svg>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  emits: ['click'],
  setup(_, { emit }) {
    return { onClick() { emit('click'); } };
  }
});
</script>

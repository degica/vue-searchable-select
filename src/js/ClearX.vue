<template>
  <svg class="vue-searchable-select-caret" @click="onClick" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.50008 6.91429L9.29297 10.7072L10.7072 9.29297L6.91429 5.50008L10.7072 1.70718L9.29297 0.292969L5.50008 4.08586L1.70718 0.292969L0.292969 1.70718L4.08586 5.50008L0.292969 9.29297L1.70718 10.7072L5.50008 6.91429Z" fill="#C1CDD8"/>
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

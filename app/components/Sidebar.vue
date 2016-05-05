<template>
  <div class="left" id="sidebar">
    <template v-for="file in root.files">
      <file :file="file"></file>
    </template>
  </div>
</template>

<script>
  import File from './File.vue'

  export default {
    props: ['root'],
    components: [File]
  }
</script>

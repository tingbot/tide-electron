<template>
  <div class="left" id="sidebar">
    <template v-for="file in sortedFiles">
      <file :file="file"></file>
    </template>
  </div>
</template>

<script>
  import File from './File.vue'

  export default {
    props: ['root'],
    components: [File],
    computed: {
      sortedFiles: function () {
        // we want the main or main.py file to be at the top of the list.
        // Otherwise, alphabetical.
        let result = this.root.files.slice();
        return result.sort((a, b) =>  {
          if (a.name === 'main.py' || a.name === 'main') {
            return -1;
          } else if (b.name === 'main.py' || b.name === 'main') {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
      }
    }
  }
</script>

<template>
  <div class="left" id="sidebar" v-on:drop="fileDropped">
    <template v-for="file in root.sortedFiles">
      <file :file="file"></file>
    </template>
  </div>
</template>

<script>
  import File from './File.vue'

  export default {
    props: ['root'],
    components: [File],
    methods: {
      fileDropped: function(event){
        event.preventDefault();
        event.stopPropagation();
        var file = event.dataTransfer.files[0];
        console.log('File you dragged here is', file.path, "dropped on sidebar");
        this.root.addFile(file.path);
        return false;
      }
    }
  }
</script>

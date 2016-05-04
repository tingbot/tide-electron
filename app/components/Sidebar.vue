<template>
  <div class="left" id="sidebar">
  <ul class="filetree" id="filetree">
    <li v-for="file in files" v-on:click="fileclicked" class='treefile' data-path="{{file.path}}">{{file.name}}</li>
  </ul>
</div>
</template>

<script>
export default {
  props: ['files'],
  methods: {
    fileclicked: function(event){
      this.$dispatch('fileClicked',event.target.getAttribute('data-path'));
    }
  }
}
</script>

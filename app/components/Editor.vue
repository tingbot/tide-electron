<template>
  <div class="main" id="editor" v-show="editorVisible">some text</div>
  <div class="main" id="image-viewer" v-if="!editorVisible">
    <img :src="file.path" />
  </div>
</template>

<script>
  import ace from 'brace'
  import 'brace/mode/python'
  import 'brace/theme/monokai'

  import FS from 'fs'

  var editor = {};

  export default {
    data: function () {
      return {file: {type: 'file'}};
    },
    ready: function () {
      // Setup our editor
      editor = ace.edit("editor");
      editor.setTheme("ace/theme/monokai");
      editor.getSession().setMode("ace/mode/python");
 
      editor.setShowPrintMargin(false);
 
      editor.$blockScrolling = Infinity;
    },
    events: {
      openFile: function(file){
        console.log("Opening editor on " + file.path);
        this.file = file;

        if (this.editorVisible) {
          file.read(function(err, data) {
            editor.setValue(data.toString('utf8'), 1);
          }); 
        }
      }
    },
    computed: {
      editorVisible: function () {
        return this.file.type != 'image';
      }
    }
 }


</script>

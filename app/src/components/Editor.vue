<template>
  <div>
    <div class="fill" id="editor" v-show="editorVisible">some text</div>
    <div class="fill" id="image-viewer" v-if="!editorVisible">
      <img :src="file.path" />
    </div>
  </div>
</template>

<script>
  import ace from 'brace'
  import 'brace/mode/python'
  import 'brace/theme/monokai'

  var editor = {};

  export default {
    data: function () {
      return {file: {type: 'file'},
        document: new ace.EditSession("Something went wrong :S","ace/mode/python")};
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
          this.document = this.file.editSession;
        }
      },
      saveFile: function(){
        console.log("Saving file: "+ this.file.path);
        console.log(this.document.getValue());
        this.file.saveTo(this.file.path);
      },
      resize: function () {
        editor.resize();
      }
    },
    computed: {
      editorVisible: function () {
        return this.file.type != 'image';
      }
    },
    watch: {
      'document': function(val){
        editor.setSession(val);
      }
    }
 }


</script>

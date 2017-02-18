<template>
  <div>
    <div class="fill" id="editor" v-show="editorVisible"></div>
    <div class="fill" id="image-viewer" v-if="!editorVisible">
      <img :src="file.path" />
    </div>
  </div>
</template>

<script>
  import ace from 'brace';
  import 'brace/mode/python';
  import 'brace/theme/monokai';
  import { isValidUTF8 } from '../utils/utils';

  var editor = {};

  export default {
    data: function () {
      return {
        file: {type: 'file'},
        document: new ace.EditSession("Something went wrong :S","ace/mode/python")};
    },
    ready: function () {
      // Setup our editor
      editor = ace.edit("editor");
      editor.setTheme("ace/theme/monokai");
      editor.getSession().setMode("ace/mode/python");

      editor.setShowPrintMargin(false);
      editor.$blockScrolling = Infinity;

      editor.focus();
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
        this.file.saveTo(this.file.path);
      },
      resize: function () {
        editor.resize();
      }
    },
    computed: {
      editorVisible: function () {
        // always use the code editor when the file type is code or text
        if (this.file.type == 'code' || this.file.type == 'text') {
          return true;
        }
        // never use the editor when type is image
        if (this.file.type == 'image') {
          return false;
        }

        // otherwise, opportunistically use it if can round-trip file->editor->file
        // without any data loss
        if (this.file.readSync) {
          const fileData = this.file.readSync();
          return isValidUTF8(fileData);
        } else {
          // can't read the file
          return false;
        }
      }
    },
    watch: {
      'document': function(val){
        editor.setSession(val);
      }
    }
 };


</script>

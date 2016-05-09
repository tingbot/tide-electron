<template>
  <div class="main" id="editor">some text</div>
</template>

<script>
  import ace from 'brace'
  import 'brace/mode/python'
  import 'brace/theme/monokai'

  import FS from 'fs'

  var editor = {};

  export default {
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

        file.read(function(err, data) {
          editor.setValue(data.toString('utf8'), 1);
        });
      }
    }
 }


</script>

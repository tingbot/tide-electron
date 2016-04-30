<template>
  <div class="main" id="editor">some text</div>
</template>

<script>
  import ace from 'brace'
  import 'brace/mode/python'
  import 'brace/theme/monokai';

  export default {
    ready: function () {
      // Setup our editor
     var editor = ace.edit("editor");
     editor.setTheme("ace/theme/monokai");
     editor.getSession().setMode("ace/mode/python");

     editor.setShowPrintMargin(false);

     editor.$blockScrolling = Infinity;
   }
 }


</script>

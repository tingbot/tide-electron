<template>
  <div id="terminal">
  </div>
</template>

<style>
  @import url(~xterm/src/xterm.css);

  #terminal, .terminal {
    background-color: #212121;
  }
  .terminal {
    padding: 5px;
    font-family: Menlo, Monaco, courier, monospace;
  }
</style>

<script>
  import pty from 'pty.js';
  import Terminal from 'xterm';
  import 'xterm/addons/fit/fit';

  export default {
    props: ['devices'],
    ready: function(){
      const el = document.getElementById('terminal');
      const childEnv = Object.assign({}, process.env, {CLICOLOR: 1});

      this.terminal = new Terminal();
      this.terminal.open(el);

      this.pty = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: childEnv
      });

      this.pty.on('data', (data) => {
        this.terminal.write(data);
      });
      this.terminal.on('key', (key, ev) => { 
        this.pty.write(key);
      });

      this.$emit('resize');
    },
    events: {
      resize: function () {
        this.terminal.fit();
        this.pty.resize(this.terminal.cols, this.terminal.rows);
      }
    }
  }
</script>

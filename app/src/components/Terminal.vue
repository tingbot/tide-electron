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
    font-size: 10px;
    font-family: Monaco, Menlo, 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    color: #eeeeee;

  }
  .terminal .terminal-cursor {
    background-color: rgba(255,255,255,0.4);
    color: inherit;
  }
</style>

<script>
  import Terminal from 'xterm';
  import 'xterm/addons/fit/fit';

  export default {
    props: ['process'],
    events: {
      resize: function () {
        if (this.terminal) {
          this.terminal.fit();
        }
        
        if (this.process) {
          this.process.resize(this.terminal.cols, this.terminal.rows);
        }
      }
    },
    watch: {
      process: function (newProcess, oldProcess) {
        if (oldProcess) {
          oldProcess.removeListener('data', this.outputFromProcess);
        }

        if (newProcess) {
          if (this.terminal) {
            this.terminal.removeAllListeners('key');
            this.terminal.removeAllListeners('exit');
            this.terminal.removeAllListeners('blur');
            this.$el.removeChild(this.terminal.element);
            this.terminal = null;
          }

          this.terminal = new Terminal();
          this.terminal.open(this.$el);

          newProcess.on('data', this.outputFromProcess);
          this.terminal.on('key', this.inputFromTerminal);

          newProcess.once('exit', (code, signal) => {
            if (code !== 0) {
              this.terminal.write(`\r\nProcess exited with code ${code}.\r\n`);
            } else if (signal !== 0) {
              this.terminal.write(`\r\nProcess exited due to signal ${signal}.\r\n`);
            } else {
              this.terminal.write(`\r\nProcess exited successfully.\r\n`);
            }
            // hide the cursor
            this.terminal.blur();
          });

          // work around a bug in xterm.js
          this.terminal.on('blur', () => {
            this.terminal.blur();
          });

          this.$emit('resize');
          this.$dispatch('ensure-visible', this);
        }
      }
    },
    methods: {
      outputFromProcess: function (data) {
        this.terminal.write(data);
      },
      inputFromTerminal: function (key) {
        this.process.write(key);
      }
    }
  }
</script>

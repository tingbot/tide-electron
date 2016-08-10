<template>

  <div class="vertical-split">
    <div class="vertical-split-top" :style="{bottom: position + 'px'}">
      <slot name="top"></slot>
    </div>

    <div
      class="horizontal-dragbar"
      v-el:bar
      v-on:mousedown="dragStart"
      :style="{ bottom: barPosition + 'px' }">
    </div>

    <div class="vertical-split-bottom" v-el:bottom :style="{height: position + 'px'}">
      <slot name="bottom"></slot>
    </div>
  </div>

</template>

<style>
  .vertical-split {
    position: relative;
  }
  .vertical-split-top {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
  }
  .vertical-split-bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .horizontal-dragbar {
    position: absolute;
    width: 100%;
    height: 1px;
    left: 0;
    cursor: row-resize;
    background-color: #d4d4d4;
    background-clip: padding-box;
    /* border to enlarge the hit area */
    border-top: 3px solid rgba(100,100,100,0.01);
    border-bottom: 3px solid rgba(100,100,100,0.01);
    z-index: 10;
  }
</style>

<script>
  export default {
    props: {
      position: {
        type: Number,
        default: 50
      },
      minPosition : {
        type: Number,
        default: 0
      },
      maxPosition : {
        type: Number,
        default: 100
      },
    },
    data: function () {
      return {
        barThickness: 0
      }
    },
    ready: function() {
      // bar thickness can only be known when we're attached to a DOM element, so it is set here
      this.barThickness = this.$els.bar.getBoundingClientRect().height;
    },
    methods: {
      dragStart: function (event) {
        window.addEventListener('mousemove', this.drag);
        window.addEventListener('mouseup', this.dragStop);

        event.preventDefault();
        event.stopPropagation();
      },
      dragStop: function (event) {
        window.removeEventListener('mousemove', this.drag);
        window.removeEventListener('mouseup', this.dragStop);

        event.preventDefault();
        event.stopPropagation();
      },
      drag: function (event) {
        const bar = this.$els.bar;
        const containerBottom = bar.offsetParent.getBoundingClientRect().bottom;
        this.position = containerBottom - event.clientY;

        if (this.position < this.minPosition) {
          this.position = this.minPosition;
        }

        if (this.position > this.maxPosition) {
          this.position = this.maxPosition;
        }
      }
    },
    computed: {
      barPosition: function () {
        return this.position - this.barThickness / 2;
      }
    },
    watch: {
      position: function () {
        // VueJS updates the DOM after this run loop has completed, so we schedule a resize
        // event to be sent after that DOM update has finished.
        this.$nextTick(() => {
          this.$broadcast('resize');
        })
      }
    },
    events: {
      'ensure-visible': function (component) {
        // if the component that wants to make sure it's visible is in our 'bottom' slot, and the
        // bottom slot is closed, open it up
        if (this.$els.bottom.contains(component.$el)) {
          if (this.position <= this.minPosition) {
            this.position = 100;
          }
        }
      }
    }
 }
</script>

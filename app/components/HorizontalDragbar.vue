<template>
  <div
    class="horizontal-dragbar"
    v-on:mousedown="dragStart"
    :style="{ bottom: barPosition + 'px' }">
  </div>
</template>

<style>
  .horizontal-dragbar {
    position: absolute;
    width: 100%;
    height: 1px;
    left: 0;
    cursor: row-resize;
    background-color: #d4d4d4;
    background-clip: padding-box;
    /* border to enlarge the hit area */
    border: 3px solid rgba(100,100,100,0.01);
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
      const bar = this.$el;
      this.barThickness = bar.getBoundingClientRect().height;
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
        const bar = this.$el;
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
    }
 }


</script>

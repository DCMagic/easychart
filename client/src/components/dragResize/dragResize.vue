<template>
<div>
  
  <div class='dragable' @mousedown='handleDown' @mouseup='handleUp' :style='boxStyle'>
  <slot></slot>
  <div id="chart">
    drag me
  </div>
  <div class='scale' @mousedown.stop='resizeStart'></div>
</div>
</div>

</template>

<script>
export default {
  replace: false,
  name: 'dragable',
  props: {
    w: {
      type: Number,
      default: 200
    },
    h: {
      type: Number,
      default: 200
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    r: {
      type: Number,
      default: 0
    },
    axis: {
      type: String,
      default: 'both'
    },
    handle: {
      type: String,
      default: ''
    },
    cancel: {
      type: String,
      default: ''
    },
    grid: {
      type: Array,
      default: function() {
        return [0, 0]
      }
    },
  },
  mounted: function() {
    var el = document.documentElement
    var event = 'mousemove'
    var handler = this.handleMove

    if (el.attachEvent) {
      el.attachEvent('on' + event, handler)
    } else if (el.addEventListener) {
      el.addEventListener(event, handler, true)
    } else {
      el['on' + event] = handler
    }
    this.initchart();
  },

  methods: {  
    resizeStart: function(e) {
      this.resizeStartX = e.clientX
      this.resizeStartY = e.clientY
      this.resizing = true
      this.lastW = this.localw
      this.lastH = this.localh
    },
    handleDown: function(e) {
      if (this.handle && !matchesSelector(e.target, this.handle)) {
        return
      }
      if (this.cancel && matchesSelector(e.target, this.cancel)) {
        return
      }
      if (!this.lastX) {
        this.lastX = e.clientX
        this.lastY = e.clientY
      }
      this.dragging = true
    },
    handleUp: function(e) {
      this.dragging = false
      this.resizing = false
      this.$emit('handleUp', {
        x: this.localx,
        y: this.localy,
        w: this.localw,
        h: this.localh,
        r: this.localr
      })
    },
    handleMove: function(e) {
      if (e.stopPropagation) e.stopPropagation()
      if (e.preventDefault) e.preventDefault()

      if (this.dragging) {
        let deltax = e.clientX - this.lastX
        let deltay = e.clientY - this.lastY

        let deltaxround = Math.round(deltax / this.grid[0]) * this.grid[0]
        let deltayround = Math.round(deltay / this.grid[1]) * this.grid[1]

        let thisx = this.localx
        let thisy = this.localy

        if (this.grid[0] > 0 && this.grid[1] > 0) {
          if (this.axis === 'both') {
            thisx = deltaxround
            thisy = deltayround
          } else if (this.axis === 'x') {
            thisx = deltaxround
          } else if (this.axis === 'y') {
            thisy = deltayround
          }
        } else {
          if (this.axis === 'both') {
            thisx = e.clientX - this.lastX
            thisy = e.clientY - this.lastY
          } else if (this.axis === 'x') {
            thisx = e.clientX - this.lastX
          } else if (this.axis === 'y') {
            thisy = e.clientY - this.lastY
          }
        }

        this.localx = thisx
        this.localy = thisy
      }
      if (this.resizing) {
        this.localw = parseInt(this.lastW) + parseInt(e.clientX) - parseInt(this.resizeStartX)
        this.localh = parseInt(this.lastH) + parseInt(e.clientY) - parseInt(this.resizeStartY)
      }
    }
  },

  data: function() {
    return {
      localx: this.x,
      localy: this.y,
      localw: this.w,
      localh: this.h,
      localr: this.r,
      lastX: 0,
      lastY: 0,
      dragging: false,
      resizeStartX: 0,
      resizeStartY: 0,
      resizing: false
    }
  },
  computed: {
    boxStyle: function() {
      return {
        width: this.localw + 'px',
        height: this.localh + 'px',
        transform: 'translate(' + this.localx + 'px,' + this.localy + 'px) '
      }
    },
    initchart() {
      var data = [{
      year: '1951 年',
      sales: 38
    }, {
      year: '1952 年',
      sales: 52
    }, {
      year: '1956 年',
      sales: 61
    }, {
      year: '1957 年',
      sales: 145
    }, {
      year: '1958 年',
      sales: 48
    }, {
      year: '1959 年',
      sales: 38
    }, {
      year: '1960 年',
      sales: 38
    }, {
      year: '1962 年',
      sales: 38
    }];
    var chart = new G2.Chart({
      container: 'chart',
      forceFit: true,
      height: window.innerHeight
    });
    chart.source(data);
    chart.scale('sales', {
      tickInterval: 20
    });
    chart.interval().position('year*sales');
    chart.render();
    }
  }
}
</script>

<style scoped>
.dragable {
  position: relative;
  border: 1px solid black;
  text-align: center;
  padding: 10px;
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
  float: left;
  margin: 10px;
}

.scale {
  position: absolute;
  width: 20px;
  height: 200px;
  bottom: 0;
  right: 0;
  background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg08IS0tIEdlbmVyYXRvcjogQWRvYmUgRmlyZXdvcmtzIENTNiwgRXhwb3J0IFNWRyBFeHRlbnNpb24gYnkgQWFyb24gQmVhbGwgKGh0dHA6Ly9maXJld29ya3MuYWJlYWxsLmNvbSkgLiBWZXJzaW9uOiAwLjYuMSAgLS0+DTwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DTxzdmcgaWQ9IlVudGl0bGVkLVBhZ2UlMjAxIiB2aWV3Qm94PSIwIDAgNiA2IiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojZmZmZmZmMDAiIHZlcnNpb249IjEuMSINCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQl4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiDT4NCTxnIG9wYWNpdHk9IjAuMzAyIj4NCQk8cGF0aCBkPSJNIDYgNiBMIDAgNiBMIDAgNC4yIEwgNCA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPg0JPC9nPg08L3N2Zz4=');
  background-position: bottom right;
  padding: 0 3px 3px 0;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: se-resize;
}
</style>

 <template>
  <div>
    <div id="preview" style="background:rgba(0,255,0,0.05)">
      <div id="box" style="position:absolute;">
        <svg id="editorborad" v-on:click="getData" />
      </div>
      <!--<el-button class='popup' type="text" @click="open">Save As Template</el-button>-->
    </div>
    <div class="test" v-on:click="getData">
      <grid-layout
        class="gridLayout"
        :layout="chartArray"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <div @click.stop>
          <grid-item
            v-for="(item,index) in chartArray"
            :key="index"
            :static="item.static"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
            :id="index"
            :style="{backgroundColor:item.color}"
            @click.native="getData(item.i)"
            @dblclick.native="changeStatic(item.i)"
          >
            <component :is="item.chartname" :ref="item.i" :id="item.j" :props="item.props"></component>
          </grid-item>
        </div>
      </grid-layout>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import VueGridLayout from "vue-grid-layout";
import groupBarChart from "../categoriesCharts/groupBarChart.vue";
import linechart from "../categoriesCharts/linechart.vue";
import piechart from "../categoriesCharts/piechart.vue";
import funnelPlot from "../categoriesCharts/funnelPlot.vue";
import barChart from "../categoriesCharts/barChart.vue";
import linechart_vega from "../categoriesCharts/linechart_vega.vue";
import scatter_vega from "../categoriesCharts/scatter_vega.vue";
import canlendar from "../categoriesCharts/canlendar.vue";

import * as d3 from "d3";
export default {
  data() {
    return {
      container: "", //canvas to drawing blueprint
      gridLayer: "gridLayer",
      chartLayer: "preview",
      baseData: {
        //基本配置
        MetaConfig: {
          title: ""
        },
        style: {
          backgroundColor: "",
          fontColor: "" //字体颜色
        },
        data: [],
        button: {
          method: "dashboard",
          title: "apply to all charts"
        }
      },
      show: false,
      changeColor: false,
      j: 0,
      selectChart: {}
    };
  },
  mounted() {
    this.$store.commit("pushToDashboardData", {baseData: this.baseData, i: "dashboard" });
    this.$store.commit("changeSelectId", "dashboard");
    this.chartInit("#preview");
  },
  computed: {
    ...mapGetters(["getIsActive", "chartArray"]),
    // ...mapGetters({ storeBaseData: "getPropsData" }),
    // ...mapGetters({ charts: "getChartDataArray" })
  },
  watch: {
    selectChart: {
      handler(newVal) {
        this.callReDraw(newVal.i,newVal.baseData);
      },
      deep: true
    },
    getIsActive: {
      //点击apply to all charts就将改变的颜色赋给所有子图
      handler(newVal) {
        this.applyColor();
      }
    }
  },
  methods: {
    changeStatic(id) {
      let that = this;
      that.j = that.j + 1;
      let count = that.j;
      this.$store.commit("changeStatic", { index: id, value: count });
    },
    getData(id) {
      //获取baseData里的内容，并传进state里
      var re = /^[0-9]+.?[0-9]*/; //判断字符串是否为数字//判断正整数/[1−9]+[0−9]∗]∗/
      if (!re.test(id)) {
        this.$store.commit("changeSelectId", "dashboard");
        this.selectChart = this.$store.state.dashboardData;
      } else {
        this.$store.commit("changeSelectId", id);
        this.selectChart = this.$store.state.chartArray[id];
      }

    },
    callReDraw(id,newVal) {

      let that = this;
      if (id<2000) {
        that.$refs[id][0].reDraw(newVal);
      } else {
        document.getElementById("box").style.backgroundColor = newVal.style.backgroundColor;
      }
    },
    applyColor() {
      let that = this;
      var chartArray = that.chartArray.map(function(item, index, array) {
        console.log(that.getIsActive);
        return (item.color = that.baseData.style.backgroundColor);
      });
    },
    chartInit(container) {
      let that = this;
      this.container = d3.select("#editorborad");
      this.container.append("g").attr("id", that.gridLayer);
      this.$store.commit("setChartLayer", { chartLayer: that.chartLayer });
      this.chartResize(window.innerWidth * 0.75, window.innerHeight);
    },
    // resizedEvent: function(i, newH, newW, newHPx, newWPx) {
    //   console.log( "RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx );
    //   this.$store.commit("commitChange", {
    //     newWidth: newWPx,
    //     newHeight: newHPx
    //   });
    // },
    chartResize(width, height) {
      let that = this;
      let drawGrids = function(width, height) {
        let lineData = [];
        for (let i = 10; i < width; i += 20) {
          lineData.push({ x1: i, y1: 0, x2: i, y2: height });
        }
        for (let i = 10; i < height; i += 20) {
          lineData.push({ x1: 0, y1: i, x2: width, y2: i });
        }
        if (that.container != "") {
          that.container
            .select("#gridLayer")
            .selectAll("*")
            .remove();

          that.container
            .select("#gridLayer")
            .selectAll(".grid_lines")
            .data(lineData)
            .enter()
            .append("line")
            .attr("x1", d => d.x1)
            .attr("x2", d => d.x2)
            .attr("y1", d => d.y1)
            .attr("y2", d => d.y2)
            .attr("stroke", "#00000030");
        }
      };

      d3.select("#editorborad")
        .attr("width", width)
        .attr("height", height);
      if (this.show) {
        //是否绘制网格
        drawGrids(width, height);
      }
    }
  },
  components: {
    groupBarChart,
    linechart,
    piechart,
    funnelPlot,
    barChart,
    linechart_vega,
    scatter_vega,
    canlendar,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  }
};
</script>
<style>
.popup {
  height: 10px;
  width: 50px;
  position: absolute;
  top: 50px;
  left: 1625px;
}
.gridLayout {
  /* background: #00f; */
  height: 1800px;
  width: 100%;
}
</style>



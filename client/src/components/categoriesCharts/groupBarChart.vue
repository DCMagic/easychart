<template>

  <div v-bind:id="id" class='container' @click="selectChart">
  </div>
</template>

<!--<script src="https://d3js.org/d3.v4.min.js"></script>-->
<script>
import G2 from "@antv/g2";
import { mapState } from 'vuex';
import $ from "jquery";

export default {
  props:{
        id:String,
        baseData: {
          type:Object,
          default: function() {
            let a= {
              MetaConfig: {
                title:'扶贫'
              },
              style:{
                color:['#0050B3', '#1890FF', '#40A9FF', '#69C0FF']
              },
              id:this.id,
              data : [{
                type: '杨家镇',
                value: 14065
              }, {
                type: '龙门镇',
                value: 11162
              }, {
                type: '新皂镇',
                value: 21191
              }, {
                type: '金峰镇',
                value: 10392
              }, {
                type: '丰谷镇',
                value: 10468
              }, {
                type: '河边镇',
                value: 12386
              }, {
                type: '柳林镇',
                value: 39193
              }, {
                type: '吴家镇',
                value: 13363
              }],
          }
              return a; 

          }
        }
      },
  data() {
    return {
      isInit:false,
      name: "bubbleChart",
      chart:{},
      
      }
  },
  computed: {
    ...mapState({
      chartSizeChange: state => state.chartSizeChange,
    })
  },
  watch: {
    'chartSizeChange': {
      deep:true,
      handler() {
        this.chart.changeSize(this.$store.state.chartSizeChange.newWidth,this.$store.state.chartSizeChange.newHeight);
      }
    }
  },
  mounted() {
    this.initChart();
    this.$store.commit("pushDataSetToState", {
          "name":"GroupBarchart",
          "interaction":"controlled"
    })
    
  },
  methods: {
    selectChart() {
      this.$store.commit("commitPropsData", this.baseData);
    },
    initChart() {
      this.chart = new G2.Chart({
        container: this.id,
        width: 484,
        height: 310,
        padding: [10, 10, 10, 10]
      });
      this.chart.source(this.baseData.data, {
        value: {
          max: 42000,
          min: 0,
          nice: false,
          //alias: '销量（百万）'
        }
      });
      this.chart.axis('type', {
        label: {
          textStyle: {
            fill: '#8d8d8d',
            fontSize: 12
          }
        },
        tickLine: {
          alignWithLabel: false,
          length: 0
        },
        line: {
          lineWidth: 0
        }
      });
      this.chart.axis('value', {
        label: null,
        title: {
          offset: 30,
          textStyle: {
            fontSize: 12,
            fontWeight: 300
          }
        },
        grid: {
          lineStyle: {
            lineWidth: 0
          }
        }
      });
      this.chart.legend(false);
      this.chart.coord().transpose();
      this.chart.interval().position('type*value').size(26).opacity(1).label('value', {
        textStyle: {
          fill: '#cdcdcd'
        },
        offset: 10
      });
      this.chart.render();
      console.log("哎呀"+(1161.79 + 340 + 801));
    },

  }
  
};
</script>






    
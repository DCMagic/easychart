<template>

  <div v-bind:id="id" class='container' @click="selectChart">
    <div v-bind:id="g2id" class="container_2">
      <H3 class="title">{{ baseData.MetaConfig.title }}</H3>
      <div id="linechart_top">
      </div>
      <div id="slider" class="slider_1"></div>
    </div>
  </div>

</template>


<script>
var elementResizeDetectorMaker = require("element-resize-detector")
import G2 from "@antv/g2";
const slider = require("@antv/g2-plugin-slider");
import { DataSet } from "@antv/data-set";
import { mapState, mapGetters } from 'vuex';
import $ from "jquery";
import linechart_vegaVue from './linechart_vega.vue';
import { autoMaxBins } from 'vega-lite/build/src/bin';
import defaultData from "../../assets/baseData"

export default {
  name: "Linechart",
  props:{
        id:String,
        // baseData: {
        //   type:Object,
        //   default: function() {
        //     let a= {
        //       MetaConfig: {
        //         title:'温度变化'
        //       },
        //       style:{
        //         color:['#35c17c','#af7eff']
        //       },
        //       id:this.id,
        //       data:this.$store.state.weatherData.lineData
        //     }
        //       return a;
        //   }
        // }
      },
  data() {
    return {
      isInit:false,
      name: "Linechart",
      chart:{},
      g2id: this.id + "_g2",
      baseData:defaultData.linechart.baseData,
    //   select_config:{
    //   "controller":'Linechart',
    //     "controllee":["Scatter"],
    //     'action':'filter',
    //     'data':'weather',
    //     'fieldname':'date'
    // }
    };
  },
  computed: {
    ...mapState({
      chartArray: state => state.chartArray,
      refreshData: state => state.chartChange,
    }),
      ...mapGetters({
        storeBaseData: "getPropsData",
        getWeatInterlineData: "getWeatherLineData"
      }),
    baseDataChange(){
      return this.baseData
    }
  },
  watch:{
    storeBaseData: {
      handler(newVal) {
        if (newVal.id == this.id) {
          this.chart.repaint();
          this.chart.changeData(newVal.data)
        }
      },
      deep: true
    },
    getWeatInterlineData:{
      handler(newVal) {
        if (newVal.chartId == this.id) {
          this.baseData.data = newVal.data;
          this.baseData.id = newVal.chartId
          this.$store.commit("commitPropsData", this.baseData);
        }
      },
      deep: true
    },
    // baseDataChange:{
    //   handler() {
    //       this.chart.destroy()
    //       //this.chart.initChart()
    //   },
    //   deep: true
    // }

  },

  mounted() {
    let that = this;
    this.initChart();

    this.baseData.id=this.id    //重新赋值id
    var erd = elementResizeDetectorMaker()
    erd.listenTo(document.getElementById(this.id),  (element)=> {
          var width = element.offsetWidth
          var height = element.offsetHeight

          this.$nextTick(function () {
            //that.chart.changeSize(width,height);
            //echarts.init(document.getElementById(this.id)).resize()
            that.chart.changeSize(width,height - 30);
            that.slider.repaint();
            //this.slider.changeSize(width,20);
          })
        })
  },
  methods: {
    selectChart() {
      this.$store.commit("commitPropsData", this.baseData);
    },
    initChart() {
      // 折线图
      this.chart = new G2.Chart({
        container: 'linechart_top',
        height: 310,
        width: 484,
      });

      var ds = new DataSet({
        state: {
          start: new Date('2012-01').getTime(),
          end: new Date('2012-12').getTime(),
        }
      });

      // console.log(this.data)
      var dv = ds.createView().source(this.baseData.data);
      dv.transform({
        type: "filter",
        callback: function callback(data) {
          var time = new Date(data.time).getTime();
          return time >= ds.state.start && time <= ds.state.end;
        }
      });

      this.chart.source(dv, {
        time: {
          type: 'time',
          mask: 'YYYY-MM',
        },
        range: [0, 1]

      });
      this.chart.tooltip({
        crosshairs: {
          type: 'line'
        }
      });
      this.chart.axis("time",{
          label:{
            textStyle:{
              fill:'#c2ccd0',
            }
          }
        });
      this.chart.axis('temperature', {
        label: {
          formatter: function formatter(val) {
            return val + '°C';
          }
        }
      });
      this.chart.area().position('time*temperature').color('city').shape('smooth');
      this.chart.line().position('time*temperature').color('city').size(0.1).shape('smooth').style({
        stroke: '#fff',
        lineWidth: 1
      });
      //this.chart.point().position('time*temperature').color('city').
      this.chart.legend(false);
      this.chart.render();

      this.chart.on('click',ev=>{

          if (typeof ev.data != "undefined" ? true : false) {
            let data1 = ev.data[0]._origin;
            let Transport_data = {}
            if (data1.item.indexOf("\r")>-1) {
              Transport_data.select_data = data1.item.replace("\r", '');
            }else {
              Transport_data.select_data=data1.item
            }
            Transport_data.chartId = this.id
            Transport_data.fieldname = 'weather'
            if (this.baseData.datamappers[0].Alias != null) {
              Transport_data.fieldname = this.baseData.datamappers[0].Alias    //字段名
            }
            this.$store.commit("commitInteracWeatherData", Transport_data)
            /*for (let i = 0; i < this.select_config.controllee.length; i++) {
              let inter_chart = this.select_config.controllee[i]
              if (inter_chart.indexOf('chart')>-1){
                inter_chart=inter_chart.replace('chart','')
              }
              if (this.baseData.datamappers[1].Alias != null) {
                this.select_config.fieldname = this.baseData.datamappers[1].Alias    //字段名
              }
              this.select_config.select_data =data1.time
              this.select_config.index = i
              console.log(this.select_config)
              this.$store.commit("commitInteracWeatherData", this.select_config)
            }*/

        }

      })

      // slider
      if (this.slider != null){
        this.slider.destroy();
      }
      this.slider = new slider({
        container: "slider",
        start: ds.state.start, // 和状态量对应
        end: ds.state.end,
        xAxis: "time",
        yAxis: "temperature",
        //width: 484,
        padding:[ 20, 20, 95, 80 ],
        data:dv,
        backgroundChart: {
          type: "line",
          color: "#feeeed"
        },
        fillerStyle: {
          fill: '#145b7d',
          fillOpacity: 0.7
        },
        textStyle:{
              fill:'#c2ccd0',
            },
        scales: {
          ['${xAxis}']:{
            type:'time',
            mask:'YYYY-MM'
          }
        },
        onChange: function onChange(_ref) {
          var startValue = _ref.startValue,
            endValue = _ref.endValue;
            var start = 0;
            var end = this.baseData.data.length - 1;
          ds.setState("start", startValue);
          ds.setState("end", endValue);
          let data_time=[startValue,endValue]
          console.log(data_time);
          //refreshFilterData(data_time);
          //Pubsub.publish("getTimeData",data_time)
          // for (let index = 0; index < this.baseData.data.length; index++) {
          //   const element = array[index];
          //   if (element == startValue) {
          //     start = index;
          //   }
          //   if (element == endValue) {
          //     end == index;
          //   }

          // }
          // this.chart.changeData(this.baseData.data.slice(start,end));
        }
      })

      this.$store.commit("pushDataSetToState", {
          "name":"Linechart",
          "interaction":"controlled"
      })
      this.slider.render();

    },
     reDraw(newVal){
      // console.log("进入到子组件来了")
      // console.log(newVal)
      this.baseData = newVal;
      this.chart.repaint();
          this.chart.changeData(newVal.data)
    },
    refreshFilterData(filterTime) {
      var start = 0;
      var end = this.baseData.data.length - 1;
      for (let index = 0; index < this.baseData.data.length; index++) {
        const element = array[index];
        if (element == filterTime[0]) {
          start = index;
        }
        if (element == filterTime[1]) {
          end == index;
        }

      }
      this.chart.changeData(this.baseData.data.slice(start,end));
    }

  }

};
</script>




<style lang="css">
.container {
    height: 100%;
    width: 100%;
  }
.container_2 {
    height: 100%;
    width: 100%;
}
.title {
  text-align: left;
  padding-left: 10px;
  padding-top: 5px;
}
#linechart_top {
  position: relative;
    height: 80%;
    width: 100%;
}
#slider {
  position: relative;
  width: 100%;
  left: 1px;
  right: -1px;
  top: 0px;
  bottom: 0px;
  text-align: center;
}
</style>


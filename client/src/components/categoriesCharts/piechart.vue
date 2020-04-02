<template>
  <div v-bind:id="id" class="container" @click="selectChart">
    <H3 class="title">{{ baseData.MetaConfig.title }}</H3>
    <div v-bind:id="g2id" class="container"></div>
  </div>
</template>

<!--<script src="https://d3js.org/d3.v4.min.js"></script>-->
<script>
  var elementResizeDetectorMaker = require("element-resize-detector");
  import G2 from "@antv/g2";
  import { mapState, mapGetters } from "vuex";
  import { DataSet } from "@antv/data-set";
  import $ from "jquery";
  import defaultData from "../../assets/baseData";
  var datamapper = [
    {
      Fieldname: "name",
      Fieldtype: "string",
      Mapfrom: null,
      Alias: null
    }
  ];
  // var select_config = {
  //   "controller":'Piechart',
  //   "controllee":["Barchart","Linechart","Scatter","Canlendar"],
  //   'action':'filter',
  //   'data':'weather'
  // }
  export default {
    name: "Piechart",
    props: {
      id: String
      // baseData: {
      //   type:Object,
      //   default: function() {
      //     let a= {
      //       MetaConfig: {
      //         title:'柱状图'
      //       },
      //       style:{
      //         color:['#35c17c','#af7eff',
      //           '#3bcaff','#27C181',
      //           '#FE902D','#FCCA74']
      //       },
      //       id:this.id,
      //       data : [{
      //         "item":"高血压","count":3228,"percent":0.13568726355611602
      //       },{
      //         "item":"糖尿病","count":880,"percent":0.036990332072299285
      //       },{
      //         "item":"老人","count":16376,"percent":0.6883564522908785
      //       },{
      //         "item":"残疾人","count":190,"percent":0.007986548970155528
      //       },{
      //         "item":"儿童","count":2765,"percent":0.11622530474989491
      //       },{
      //         "item":"精神病","count":351,"percent":0.014754098360655738
      //       }],
      //       datamappers: datamapper,
      //       width: 484,
      //       height: 310,
      //   }
      //       return a;

      //   }
      // }
    },
    data() {
      return {
        isInit: false,
        name: "Piechart",
        chart: {},
        baseData: defaultData.piechart.baseData,
        g2id: this.id + "_g2"
      };
    },
    computed: {
      ...mapState({
        chartArray: state => state.chartArray,
        refreshData: state => state.chartSizeChange
      }),
      ...mapGetters({
        storeBaseData: "getPropsData",
        getWeatPieData: "getWeatherPrData"
      }),
      dataMap() {
        return this.storeBaseData;
      }
    },
    watch: {
      refreshData: {
        deep: true,
        handler() {
          //this.chart.changeSize(this.$store.state.chartSizeChange.newWidth,this.$store.state.chartSizeChange.newHeight);
          console.log("更改了wh");
        }
      },
      // storeBaseData: {
      //   handler(newVal) {
      //     console.log(newVal);
      //       // this.chart.repaint();
      //       this.chart.changeData(newVal.data);

      //   },
      //   deep: true
      // },
      getWeatPieData: {
        handler(newVal) {
          if (newVal.chartId == this.id) {
            this.baseData.data = newVal.data;
            this.baseData.id = newVal.chartId
            this.$store.commit("commitPropsData", this.baseData);
          }},
        deep: true
      },
      dataMap: {
        handler(newVal) {
          if (newVal.id == this.id) {
            if (newVal.datamappers === undefined) {
              this.baseData.datamappers = datamapper;
            } else {
              this.baseData.datamappers = newVal.datamappers;
            }

            if (newVal.datamappers[0].Alias != null) {
              this.$store.commit("commitPieData", newVal.datamappers[0].Alias);
            }
          }
        },
        deep: true
      }
    },
    mounted() {
      let that = this;
      this.initChart();

      var erd = elementResizeDetectorMaker();
      erd.listenTo(document.getElementById(this.id), element => {
        var width = element.offsetWidth;
        var height = element.offsetHeight;

        this.$nextTick(function() {
          console.log("实现了");
          //that.chart.changeSize(width,height);
          //echarts.init(document.getElementById(this.id)).resize()
          this.chart.changeSize(width, height);
        });
      });
    },
    methods: {
      selectChart() {
        this.$store.commit("commitPropsData", this.baseData);
      },
      reDraw(newVal) {
        let reData = newVal.data;
        for (let i = 0; i < reData.length; i++) {
          reData[i].count = parseInt(reData[i].count);
        }
        // console.log(reData);
        var dv = new DataSet().createView().source(reData);
        dv.transform({
          type: "percent",
          field: "count",
          dimension: "item",
          as: "percent"
        });
        // console.log(dv.rows)
        this.chart.repaint();
        this.chart.changeData(dv);
      },
      initChart() {
        this.chart = new G2.Chart({
          container: this.g2id,
          width: this.baseData.width,
          height: this.baseData.height,
          padding: ["8%", "15%", "25%", "15%"]
        });
        this.chart.source(this.baseData.data, {
          percent: {
            formatter: function formatter(val) {
              val = (val * 100).toFixed(2) + "%";
              return val;
            }
          }
        });
        this.chart.coord("theta", {
          radius: 0.75,
          innerRadius: 0.6
        });
        this.chart.legend(true);
        // this.chart.coord('theta', {
        //   radius: 1
        // })
        this.chart.tooltip({
          showTitle: false,
          itemTpl:
            '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
        });

        this.chart
          .intervalStack()
          .position("percent")
          .color("item", this.baseData.style.color)
          .label("percent", {
            // autoRotate: false,
            formatter: function formatter(val, item) {
              return item.point.item + ": " + val;
            }
          })
          .tooltip("item*percent", function(item, percent) {
            percent = (percent * 100).toFixed(2) + "%";
            return {
              name: item,
              value: percent
            };
          })
          .style({
            lineWidth: 1,
            stroke: "#fff"
          })
          .select({
            animate: false
          });

        //点击交互
        this.chart.on("click", ev => {
          console.log(ev)
          if (typeof ev.data != "undefined" ? true : false) {

            const data = ev.data._origin;
            let Transport_data = {}
            Transport_data.select_data = data.item.replace("\r", '');
            Transport_data.chartId = this.id
            Transport_data.fieldname = 'weather'
            if (this.baseData.datamappers[0].Alias != null) {
              Transport_data.fieldname = this.baseData.datamappers[0].Alias    //字段名
            }
            this.$store.commit("commitInteracWeatherData", Transport_data)
          }
          /*    let select_config = this.$store.state.select_config
                if (typeof ev.data != "undefined" ? true : false) {

                  for (let i = 0; i < select_config.controllee.length; i++) {
                    let inter_chart = select_config.controllee[i]
                    if (inter_chart.indexOf('chart')>-1){
                      inter_chart=inter_chart.replace('chart','')
                    }
                    if (this.baseData.datamappers[0].Alias != null) {
                      select_config.fieldname = this.baseData.datamappers[0].Alias    //字段名
                    }
                    select_config.select_data =data.item.replace("\r",'')
                    select_config.index = i
                    this.$store.commit("commitInteracWeatherData",select_config)
                  }
                }*/
          // else {
          //   this.$store.commit("commitZongWeatherData", 1);
          // }

          // if (typeof ev.data != "undefined" ? true : false) {
          //   const data = ev.data._origin;
          //   this.$store.commit("commitInteracBarData", data.item);
          //   this.$store.commit("commitInteracCanlendarData", data.item);
          //   this.$store.commit("commitInteracScatterData", data.item);
          //   this.$store.commit("commitInteracLineData", data.item);
          // } else {
          //   this.$store.commit("commitZongWeatherData", 1);
          // }
        });
        this.chart.render();

        this.$store.commit("pushDataSetToState", {
          name: "Piechart",
          interaction: "controlled"
        });
      }
    }
  };
</script>


<style scoped>
  .title {
    position: relative;
    padding-left: 10px;
    padding-top: 5px;
    text-align: left;
  }
  .container {
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>





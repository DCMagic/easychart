<template>
  <div v-bind:id="id" class='container' @click="selectChart">
  </div>
</template>

<script>
  var elementResizeDetectorMaker = require("element-resize-detector")
  import { mapGetters} from 'vuex'
  import echarts from 'echarts'
  import defaultData from "../../assets/baseData"


  // var select_config = {
  //   "controller":'Canlendar',
  //   "controllee":["Barchart","Scatter"],
  //   'action':'filter',
  //   'data':'weather',
  //   'fieldname':'date'
  // }
  export default {
      name: "Canlendar",
      props:{
          id:String
      },
      data(){
        return {
          name:"Canlendar",
          myChart:"",
          option:"",
          // baseData:{
          //       MetaConfig:{
          //         title:"日历图",
          //       },
          //       style:{
          //         color:['#e0ffff', '#006edd']
          //       },
          //       id:this.id,
          //       data:this.$store.state.weatherData.canlenderData
          //       // data:this.getVirtulData(2017)
          //     }
          baseData:defaultData.canlendar.baseData,
          }
      },
      computed:{
        ...mapGetters({'storeBaseData': 'getPropsData'}),
        ...mapGetters({'weatherCanlIntData': 'getWeatherCanlendarData'}),
      },
      methods:{
        selectChart(){
          this.baseData.data = this.changeObject(this.baseData.data)
          this.$store.commit("commitPropsData",this.baseData)
        },
        changeObject(data){
          let a =[]
          for (let i = 0; i < data.length; i++) {
            a.push({
              date:data[i][0],
              value:data[i][1]
            })
          }
          return a
        },
        reDraw(newVal){
      // console.log("进入到子组件来了")
      // console.log(newVal)
      this.myChart.setOption({
              visualMap:{
                inRange:{
                  color:newVal.style.color,
                }
              },

              title:{
                text: newVal.MetaConfig.title
              },
              series:{
                data:this.changeArray(newVal.data)
              }
            })
    },

        changeArray(data){
          let a=[]
          for (let i = 0;i<data.length;i++){
            a.push([data[i].date,data[i].value])
          }
          return a
        },
        getVirtulData(year) {
          // year = year;
          var date = +echarts.number.parseDate(year + '-01-01');
          var end = +echarts.number.parseDate((+year + 1) + '-01-01');
          var dayTime = 3600 * 24 * 1000;
          var data = [];
          for (var time = date; time < end; time += dayTime) {
            data.push([
              echarts.format.formatTime('yyyy/MM/dd', time),
              Math.floor(Math.random() * 1000)
            ]);
          }
          return data;
        },
        // eval(newbaseData){
        // },
      },
      mounted(){
        this.baseData.id=this.id
        this.myChart=echarts.init(document.getElementById(this.id));
        this.option = {
          title:{
            text:'Temp_max'
          },
          tooltip: {
            position: 'top',
            formatter: function (p) {
              var format = echarts.format.formatTime('yyyy-MM-dd', p.data[0]);
              return format + ': ' + p.data[1];
            }
          },
          visualMap: {
            min: 0,
            max: 60,
            calculable: true,
            orient: 'vertical',
            right: '0',
            top: 'center',
            inRange: {
              color: this.baseData.style.color,
              opacity: 1
            },
            controller: {
              inRange: {
                opacity: 0.5
              }
            }
          },

          calendar: [
            {
              cellSize: [ 'auto'],
              // right:10,
              left:50,
              right:80,
              bottom: 10,
              orient: 'vertical',
              range: '2012',
              dayLabel: {
                margin: 5
              }
            }],

          series: [{
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: this.baseData.data
          }]
        };

        this.myChart.setOption(this.option,true)


        this.myChart.on('click', (d)=>{

          let select_config = this.$store.state.select_config
          if (select_config.controller==this.name) {
            for (let i=0;i<select_config.controllee.length;i++){
              let inter_chart = select_config.controllee[i]
              if (inter_chart.indexOf('chart')>-1){
                inter_chart=inter_chart.replace('chart','')
              }
              if (this.baseData.datamappers[1].Alias != null) {
                select_config.fieldname = this.baseData.datamappers[1].Alias    //字段名
              } //字段名
              select_config.select_data =d.data[0]
              select_config.index = i
              this.$store.commit("commitInteracWeatherData", select_config)
            }
          }
        })


        var erd = elementResizeDetectorMaker()
        erd.listenTo(document.getElementById(this.id),  (element)=> {
          var width = element.offsetWidth
          var height = element.offsetHeight
          this.$nextTick(function () {
            //使echarts尺寸重置
            echarts.init(document.getElementById(this.id)).resize()
          })
        })
        this.$store.commit("pushDataSetToState", {
          "name":"Canlendar",
          "interaction":"controlled"
        })
      },
    watch:{
      storeBaseData:{
        handler(newVal){
          if (this.id==newVal.id) {
            this.myChart.setOption({
              visualMap: {
                inRange: {
                  color: newVal.style.color,
                }
              },

              title: {
                text: newVal.MetaConfig.title
              },
              series: {
                data: this.changeArray(newVal.data)
              }
            })
            // console.log(newVal)
          }
        },
        deep:true
      },
      weatherCanlIntData:{
        handler(newVal){
          if (newVal.chartId == this.id) {
            this.baseData.id = newVal.chartId
            this.baseData.data = this.changeObject(newVal.data)
            this.$store.commit("commitPropsData", this.baseData)
            this.reDraw(this.baseData)
          }
        },
        deep:true
      }
    }
    }
</script>

<style scoped>
  .container {
    height: 100%;
    width: 100%;
    border: 3px solid white;
  }
</style>

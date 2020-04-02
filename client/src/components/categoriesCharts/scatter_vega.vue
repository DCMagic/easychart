<template>
    <div v-bind:id="id" class='container' @click="selectChart">
        <div v-bind:id="vegaid" class='container'>
        </div>
    </div>
</template>

<script>
import * as vega from 'vega';
import {mapGetters} from 'vuex';
import vegaEmbed from "vega-embed";
var elementResizeDetectorMaker = require("element-resize-detector")
import defaultData from "../../assets/baseData"
export default {
    name: "scatter_vega",
    props:{
        id:String,
        // baseData:{
        //     type:Object,
        //     default: function(){
        //         let data = {
        //             MetaConfig: {
        //                 title: "scatter_vega"
        //             },
        //             style:{
        //                 color:['#ffffff']
        //             },
        //             id: this.id,
        //             data: this.$store.state.weatherData.pointData,
        //             width: 200,
        //             height: 200
        //         }
        //         return data
        //     }
        // }
    },
    data(){
        return {
            myChart: null,
            app: {},
            option: "",
            vegaid: this.id + "_vega",
            baseData:defaultData.scatter_vega.baseData,
        }
    },
    computed:{
        ...mapGetters({storeBaseData: 'getPropsData',
          WeatherScatterData :'getWeatherScatterData'
        }),
        t(){
            return{
                "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
                "description": this.baseData.MetaConfig,
                "data": {"values": this.baseData.data},
                "mark": "point",
                "encoding": {
                    "x": {"field": "x","type": "ordinal"},
                    "y": {"field": "y","type": "quantitative"}
                },
                "width": this.baseData.width,
                "height": this.baseData.height,
                "autosize": {
                    "type": "fit",
                    "contains": "padding"
                }
            }
        }
    },
    mounted(){
        let that = this
        this.draw()

      this.baseData.id=this.id    //重新赋值id
        var erd = elementResizeDetectorMaker()
        erd.listenTo(document.getElementById(that.id), (element)=>{
            this.baseData.width = element.offsetWidth
            this.baseData.height = element.offsetHeight
            this.$nextTick(()=>{
                that.draw()
            })
        })

        this.$store.commit("pushDataSetToState", {
          "name":"Scatter_vega",
          "interaction":"controlled"
        })
    },
    methods:{
        draw(){
            vegaEmbed("#"+this.id + "_vega", this.t, { theme: "default" });
        },
        selectChart(){
            this.$store.commit("commitPropsData",this.baseData)
        },
        reDraw(newVal){
          if (newVal.id == this.id) {
            this.baseData.style.color = newVal.style.color
            this.baseData.MetaConfig.title = newVal.MetaConfig.title
            this.baseData.data = newVal.data
            this.draw()
          }
    },
    },
    watch:{
        storeBaseData: {
            handler(newVal){
                if (newVal.id==this.id){
                    this.baseData.style.color = newVal.style.color,
                    this.baseData.MetaConfig.title = newVal.MetaConfig.title
                    this.baseData.data = newVal.data
                    this.draw()
                }
            },
          deep:true
        },
      WeatherScatterData:{
        handler(newVal){

          console.log(newVal)
          console.log(this.id)
          if (newVal.chartId == this.id) {
            this.baseData.data = newVal.data;
             this.baseData.id = newVal.chartId
            this.$store.commit("commitPropsData", this.baseData);
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
  }
</style>

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
export default {
    name: "linechart_vega",
    props:{
        id:String,
        baseData:{
            type:Object,
            default: function(){
                let data = {
                    MetaConfig: {
                        title: "linechart_vega"
                    },
                    style:{
                        color:['#ffffff']
                    },
                    id: this.id,
                    data: [
                        {"x": 1990, "y": 0},
                        {"x": 2000, "y": 2010},
                        {"x": 2010, "y": 0},
                        {"x": 2020, "y": 2030},
                        {"x": 2030, "y": 0}
                    ],
                    width: 200,
                    height: 200
                }
                return data
            }
        }
    },
    data(){
        return {
            myChart: null,
            app: {},
            option: "",
            vegaid: this.id + "_vega"
        }
    },
    computed:{
        ...mapGetters({'storeBaseData': 'getPropsData'}),
        t(){
            return{
                "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
                "description": this.baseData.MetaConfig,
                "data": {"values": this.baseData.data},
                "mark": "line",
                "encoding": {
                    "x": {"field": "x", "type": "quantitative"},
                    "y": {"field": "y", "type": "quantitative"}
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
        that.draw()
        var erd = elementResizeDetectorMaker()
        erd.listenTo(document.getElementById(that.id), (element)=>{
            this.baseData.width = element.offsetWidth
            this.baseData.height = element.offsetHeight
            this.$nextTick(()=>{
                that.draw()
            })
        })
        this.$store.commit("pushDataSetToState", {
          "name":"Linechart_vega",
          "interaction":"controlled"
      })
      
    },
    methods:{
        draw(){
            vegaEmbed("#"+this.id + "_vega", this.t, { theme: "default" });
        }, 
        selectChart(){
        //commit传值
        this.$store.commit("commitPropsData",this.baseData)
      }

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
            }
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
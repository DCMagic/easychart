<template>

  <div v-bind:id="id" class='container' @click="selectChart">
  </div>
</template>

<script>
  var elementResizeDetectorMaker = require("element-resize-detector")
  import { mapGetters} from 'vuex'   //野
  import echarts from 'echarts'
  export default {
    name: "funnel",
    props: {
      id: String,
      baseData:{
        type:Object,
        default:function () {
          let a= {
            MetaConfig: {
              title:'漏斗'
            },
            style:{
              color:['#0050B3', '#1890FF', '#40A9FF', '#69C0FF']
            },
            id:this.id,
            data :[{"name": "建档居民", "value": "2235030"}, {"name": "体检居民", "value": "1167906"}, {
              "name": "签约居民",
              "value": "21039"
            }, {"name": "个性化签约居民", "value": 10872}]
          }
            return a
          }
      }
    },
    data(){
      return {
        myChart:"",
        app:{},
        option:""
      }
    },
    methods: {
      draw(){
        //  console.log(d3.select('#2'))
        const container=document.getElementById(this.id)
        // console.log(this.id, container)
        this.myChart = echarts.init(container);
        this.myChart.setOption(this.t)
        this.$store.commit("pushDataSetToState", {
          "name":"testChart",
          "interaction":"controler"
        })
      },
      selectChart(){
        //commit传值
        // console.log("dd")
        this.$store.commit("commitPropsData",this.baseData)
      }

    },

    mounted(){

      this.draw()
      var erd = elementResizeDetectorMaker()
      erd.listenTo(document.getElementById(this.id),  (element)=> {
        var width = element.offsetWidth
        var height = element.offsetHeight
        this.$nextTick(function () {
          //使echarts尺寸重置
          echarts.init(document.getElementById(this.id)).resize()
        })
      })

      this.myChart.on("click", (d)=>{
        let b={
          name:d.name,
          value:d.value
        }
        this.$store.commit("InteractionData",b)
      })

    },

    computed:{
      ...mapGetters({'storeBaseData': 'getPropsData'}),    //野
      t(){
        return{
          color: this.baseData.style.color,
          title: {
            text: this.baseData.MetaConfig.title,
            // subtext: '纯属虚构'
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c}"
          },
          // toolbox: {
          //     feature: {
          //         dataView: {readOnly: false},
          //         restore: {},
          //         saveAsImage: {}
          //     }
          // },
          // legend: {
          //   data: ['建档居民', '体检居民', '签约居民', '个性化签约居民']
          // },
          calculable: true,
          series: [
            {
              name: '漏斗图',
              type: 'funnel',
              left: '10%',
              top: 60,
              //x2: 80,
              bottom: 60,
              // width: '80%',
              label: {
                show: true,
                position: 'inside'
              },
              labelLine: {
                length: 10,
                lineStyle: {
                  width: 1,
                  type: 'solid'
                }
              },
              emphasis: {
                label: {
                  fontSize: 20
                }
              },
              data:this.baseData.data
            }
          ]
        };
      },

    },
    watch:{    //野
      storeBaseData: {
        handler(newVal){
          if (newVal.id==this.id){
            this.myChart.setOption({
              color:newVal.style.color,
              title:{
                text: newVal.MetaConfig.title
              },
              series:{
                data:newVal.data
              }
            })
          }

          // console.log(newVal)
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

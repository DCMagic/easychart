import Vue from "vue";
import Vuex from "vuex";
//import cart from './modules/cart'
//import products from './modules/products'
//import createLogger from '../../../src/plugins/logger'
import action from "./action";
import getter from "./getter";
import mutation from "./mutation";
Vue.use(Vuex);

const state = {
  chartLayer: "",
  dashboardId:"",
  chartComponentArray: [], //图表组件数组
  chartArray: [], //所有图的basedata
  dashboardData:"",//dashboard中的数据
  selectChartId: "", //选中图表的ID
  chartSizeChange: {},
  propsData:'',
  isActive: false,
  popUp:false,
  interacBarData:[],   //交互Bar数组
  interacCanlendarData:[],   //交互Canlendar
  interacScatterData:[],   //交互Point
  interacWeatherData:[],   //交互总的数据
  interacPieData:[],   //交互pie
  interacLineData:[],   //交互先
  dataMapper:[],
  weatherData:{},
  dataInfoStore:[],

  //相同数据字段配置
  sameFiledName:{
    "controller":{
      chartId:'',
      type:'Piechart'
    },
    "controllee":{
      chartId:'',
      type:'Barchart'
    },
    "FileName":'weather'
  },
  //共用数据的配置
  select_config:[
    ]
};

export default new Vuex.Store({
  state: state,
  mutations: mutation,
  actions: action,
  getters: getter
});

const getter = {
    someLists: state => param => {
        return state.someLists.filter(() => param.done)
    },
    chartArray:state => {
        return state.chartArray
    },
    layout:state =>{
        return state.rects
    },
    getIsActive: state=>{
        return state.isActive
    },
  getPropsData: state => {    //野
    return state.propsData
  },

  getWeatherBarData: state => {
    return state.interacBarData
  },
  getWeatherPrData: state => {
    return state.interacPieData
  },
  getWeatherCanlendarData: state => {
    return state.interacCanlendarData
  },
  getWeatherScatterData: state => {
    return state.interacScatterData
  },
  getWeatherLineData:state=>{
      return state.interacLineData
  },
  getInteractionData:state=>{
      return state.interactionData
  },
  getChartComponentArray: state=>{
      return state.chartComponentArray
  },
  getSelectChartId:state=>{
      return state.selectChartId
  },
  getChartDataArray:state=>{
      return state.chartArray
  }
  // getBarData:state=>{
  //     return state.barData
  // }
}

export default getter

import mapperdata from "./MapperData.js";
import store from "./store.js";
var mapperdatas = null;
var datamap = null;
const mapperdatamanage = {
  setdatamap(data) {
    datamap = data;
  },
  setmapperdata(data) {
    store.state.chartArray[
      store.state.selectChartId
    ].baseData.mapperdatas = data;
    //mapperdatas = data;
  },
  getmapperdata() {
    return mapperdatas != null ? mapperdata : null;
  },
  getdatamap() {
    return datamap != null ? datamap : null;
  },
  startanalyzedata() {
    if (mapperdata != null && datamap != null) {
      mapperdata.analyzedata(
        datamap,
        store.state.chartArray[store.state.selectChartId].baseData.mapperdatas
      );
    }
  }
};
export default mapperdatamanage;

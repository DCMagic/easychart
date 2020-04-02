import DataProvide from './DataProvider'


export default class DataProxy{
  static async initChartsData(){
    DataProvide.getCarJson().then((item)=>{
      console.log(item)
    })
  }


}

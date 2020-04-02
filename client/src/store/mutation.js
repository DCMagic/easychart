var interactive_config = require("../assets/interactive.json");


const mutation = {
  increment(state, payload) {
    state.count += payload.step || 1;
  },
  createChartComponet(state, chartobj) {
    state.chartComponetArray.push(chartobj);
  },
  setChartLayer(state, payload) {
    state.chartLayer = payload.chartLayer;
  },
  pushDataSetToState(state, dataset) {
    state.chartComponentArray.push(dataset);
  },
  addToArray(state,payload) {
    state.chartArray.push(payload);
  },
  pushToDashboardData(state, payload) {
    state.dashboardData= payload;
  },
  changeSelectId(state, payload) {
    state.selectChartId = payload;
  },
  // 右侧栏提交改变的数据
  reChartData(state, payload) {
    state.chartComponentArray[parseInt(payload.id) - 1] = payload;
    console.log("修改成功");
  },
  editInteraction(state, payload) {
    state.popUp = !state.popUp;
  },
  // 提交更改视图的类型
  // commitChange(state, payload){
  //     state.chartSizeChange = payload;
  // },
  commitIsActive(state, payload) {
    state.isActive = payload;
  },
  commitPropsData(state, payload) {
    state.propsData = payload;
  },
  updateDataMapper(state, payload) {
    console.log(payload)
    state.dataMapper = JSON.parse(JSON.stringify(payload));
  },

  //天气数据
  commitWeatherData(state, payload) {
    state.weatherData.baseData = payload;
    state.weatherData.barData = Data(payload, "bar");
    state.weatherData.pieData = Data(payload, "pie");
    state.weatherData.canlenderData = Data(payload, "canlender");
    state.weatherData.pointData = Data(payload, "scatter");
    state.weatherData.lineData = Data(payload, "line");

    // console.log(state.weatherData.lineData)
  },

  //根据payload过滤天气数据
  commitInteracBarData(state, payload) {
    console.log(payload);
    for (let i = 0; i < interactive_config.length; i++) {
      if (payload.controller == interactive_config[i].controller) {
        for (let j = 0; j < payload.controllee.length; j++) {
          let interact_type_chart = payload.controllee[j].replace("chart", "");

          state["interac" + interact_type_chart+ "Data"] = interationData(
            state.weatherData.baseData,
            interact_chart_data.toLowerCase(),
            payload.select_data
          );
        }
      }
    }

    // state.interacBarData =interationData(state.weatherData.baseData,"bar" ,payload)
  },
  commitInteracCanlendarData(state, payload) {
    for (let i = 0; i < interactive_config.length; i++) {
      if (payload.controller == interactive_config[i].controller) {
        for (let j = 0; j < payload.controllee.length; j++) {
          let interact_chart_data = payload.controllee[j];
          state["interac" + interact_chart_data + "Data"] = interationData(
            state.weatherData.baseData,
            interact_chart_data.toLowerCase(),
            payload
          );
        }
      }
    }
    //   console.log(payload)
    // state.interacCanlendarData =interationData(state.weatherData.baseData,"canlender" ,payload)
  },
  commitInteracScatterData(state, payload) {
    state.interacScatterData = interationData(
      state.weatherData.baseData,
      "scatter",
      payload
    );
  },

  commitInteracWeatherData(state, payload) {
    if (state.select_config[0].hasOwnProperty("FiledName")) {
      sameFiledName(state,payload)
    }else {
      sharing_data(state,payload)
    }

  },

  commitsameFiledNameDate(state,controller_chart_data){
    console.log(state)

  },
  commitInteracLineData(state, payload) {
    state.interacLineData = interationData(
      state.weatherData.baseData,
      "line",
      payload
    );
  },
  commitZongWeatherData(state, payload) {
    state.interacBarData = state.weatherData.barData;
    state.interacCanlendarData = state.weatherData.canlenderData;
    state.interacScatterData = state.weatherData.pointData;
    state.interacLineData = state.weatherData.lineData;
  },

  commitDataMapper(state, payload) {
    if (payload[0] == "precipitation" && payload[1] == "date") {
      state.interacBarData = state.weatherData.barData;
    }
  },
  commitPieData(state, payload) {
    if (payload == "weather") {
      state.interacPieData = state.weatherData.pieData;
    }
  },

  InteractionData(state, payload) {
    if (payload == 0) {
      state.interactionData = [];
    } else {
      let isHave = state.interactionData.some(item => {
        if (item.name == payload.name) {
          return true;
        }
      });
      if (!isHave) {
        state.interactionData.push(payload);
      }
    }
  },
  changeStatic(state, payload) {
    console.log(payload.value);
    console.log(payload.value % 2 == 1);
    if (payload.value % 2 == 1) {
      state.chartArray[payload.index].static = true;
    } else {
      state.chartArray[payload.index].static = false;
    }
  },
  commitDataInfoStore(state, payload){
    state.dataInfoStore.push(payload)
  }
};

export default mutation;

//init 天气数据
function Data(payload, type) {
  let arr_bar = [];
  let arr_pie = [],
    arrpie = [];
  let arr_canlender = [];
  let arr_point = [];
  let arr_line = [];
  for (let i = 0; i < payload.length; i++) {
    if (payload[i].date.indexOf("2012") > -1) {
      arr_bar.push(
        //柱状图
        {
          name: payload[i].date,
          value: payload[i].precipitation
        }
      );
      arrpie.push(payload[i].weather); //圆环
      arr_canlender.push([payload[i].date, payload[i].temp_max]); //日历图数据
      arr_point.push(
        //散点数据
        {
          x: payload[i].date,
          y: payload[i].wind
        }
      );
      arr_line.push(
        {
          time: payload[i].date,
          city: "max",
          temperature: parseInt(payload[i].temp_max)
        },
        {
          time: payload[i].date,
          city: "min",
          temperature: parseInt(payload[i].temp_min)
        }
      );
    }
  }
  let a = can_data(arrpie);

  for (let i = 0; i < a.length; i++) {
    arr_pie.push({
      item: a[i][0],
      count: a[i][1],
      percent: a[i][1] / payload.length
    });
  }
  switch (type) {
    case "bar":
      return arr_bar;
    case "pie":
      return arr_pie;
    case "canlender":
      return arr_canlender;
    case "scatter":
      return arr_point;
    case "line":
      return arr_line;
  }
}

function interationData(payload, type, factor) {
  let arr_bar = [];
  let arr_pie = [],
    arrpie = [];
  let arr_canlender = [];
  let arr_point = [];
  let arr_line = [];
  for (let i = 0; i < payload.length; i++) {
    //
    // console.log(payload[i][factor.fieldname])
    // console.log(factor.select_data)
    if (
      payload[i].date.indexOf("2012") > -1 &&
      payload[i][factor.fieldname] == factor.select_data
    ) {//控制字段名和选择的值
      arr_bar.push(
        //柱状图
        {
          name: payload[i].date,
          value: payload[i].precipitation
        }
      );
      arrpie.push(payload[i].weather); //圆环
      arr_canlender.push([payload[i].date, payload[i].precipitation]); //日历图数据   降水量

      arr_point.push(
        //散点数据
        {
          x: payload[i].date,
          y: payload[i].wind
        }
      );
      arr_line.push(
        {
          time: payload[i].date,
          city: "max",
          temperature: parseInt(payload[i].temp_max)
        },
        {
          time: payload[i].date,
          city: "min",
          temperature: parseInt(payload[i].temp_min)
        }
      );
    }
  }
  let a = can_data(arrpie);

  for (let i = 0; i < a.length; i++) {
    arr_pie.push({
      item: a[i][0],
      count: a[i][1],
      percent: a[i][1] / payload.length
    });
  }
  switch (type) {
    case "bar":
      return arr_bar;
    case "pie":
      return arr_pie;
    case "canlendar":
      return arr_canlender;
    case "scatter":
      return arr_point;
    case "line":
      return arr_line;
  }
}

//单个数组合并重复项成二维数组
function can_data(_arr) {
  var _res = []; //
  _arr.sort();
  for (var i = 0; i < _arr.length; ) {
    var count = 0;
    for (var j = i; j < _arr.length; j++) {
      if (_arr[i] == _arr[j]) {
        count++;
      }
    }
    _res.push([_arr[i], count]);
    i += count;
  }
  //_res 二维数维中保存了 值和值的重复数
  return _res;
}


//共用同种数据的数据处理方法
function sharing_data(state,payload) {
  let select_config = state.select_config
  console.log(payload)
  for (let i = 0; i < interactive_config.length; i++) {
    if (select_config[0].type == interactive_config[i].controller&&
      (select_config[0].chartId == payload.chartId)) {

      for (let j=0;j<select_config[0].controllee.length;j++) {
        let interact_type_chart= select_config[0].controllee[j].type;
        if (interact_type_chart.indexOf("chart") > -1) { //去掉chart
          interact_type_chart= interact_type_chart.replace("chart", "");
        }
        let Transport_Data = {
          data:interationData(state.weatherData.baseData,
            interact_type_chart.toLowerCase(), payload),
          chartId:select_config[0].controllee[j].chartId
        }

        console.log(interact_type_chart)
        state["interac" + interact_type_chart+ "Data"] = Transport_Data
      }
    }
  }
}
//相同字段的方法
function sameFiledName(state,payload) {
  let select_config = state.select_config[0]
  // payload.fieldname==select_config.FiledName
  console.log(payload)
  let chartArray = state.chartArray
  if (select_config.chartId ==payload.chartId){
    for( let i=0;i<select_config.controllee.length;i++){
      let chart_id= select_config.controllee[i].chartId
      let index  = chart_id.charAt(chart_id.length-1)


      console.log(chartArray[index].baseData.data)
      console.log(payload.select_data)
      let Transport_Data = {
        data:find_data(chartArray[index].baseData.data,payload.select_data),
        chartId:select_config.controllee[i].chartId
      }
      //确定图的类型
      let interact_type_chart= select_config.controllee[i].type;
      if (interact_type_chart.indexOf("chart") > -1) { //去掉chart
        interact_type_chart= interact_type_chart.replace("chart", "");
      }

      console.log(Transport_Data)
      state["interac" + interact_type_chart+ "Data"] = Transport_Data

    }
  }
}
function find_data(data,filterdata) {
  let arr=[]

 for (let i=0;i<data.length;i++){
   let data_name = data[i].name
   if (data_name.indexOf("\r")>-1){
     data_name=data_name.replace("\r", '')
   }
   if (data_name == filterdata){
     arr.push(data[i])
   }
 }
 return arr
}

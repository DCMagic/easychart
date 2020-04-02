<template>
  <div id="Store" >
    <el-collapse>
      <el-collapse-item title="Data Store">
        <div>
          <div id="staticdata">
            <ul></ul>
          </div>
        </div>
        <div class="el-icon-plus"></div>
      </el-collapse-item>
      <el-collapse-item title=" Chart Store">
        <div>
          <el-carousel :interval="4000" type="card" height="70px">
            <el-carousel-item v-for="item in imgArrayone" :key="item.id">
              <el-row>
                <el-col :span="24">
                  <img
                    ref="imgHeight"
                    :src="item.idView"
                    @mouseover="createClone($event,item.chartType,'echarts')"
                    @mouseout="deletClone($event)"
                  />
                </el-col>
              </el-row>
            </el-carousel-item>
          </el-carousel>
        </div>
        <div>
          <el-carousel :interval="4000" type="card" height="70px">
            <el-carousel-item v-for="item in imgArraytwo" :key="item.id">
              <el-row>
                <el-col :span="24">
                  <img
                    ref="imgHeight"
                    :src="item.idView"
                    @mouseover="createClone($event,item.chartType,'D3')"
                    @mouseout="deletClone($event)"
                  />
                </el-col>
              </el-row>
            </el-carousel-item>
          </el-carousel>
        </div>
      </el-collapse-item>
      <el-collapse-item title="Template Store"></el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import stores from "../../store/store.js";
import mutations from "../../store/mutation.js";
import $ from "jquery";
import * as d3 from "d3";
import store from "../../store/store.js";
import axios from "axios";
import mapperdataM from "../../store/MapperDataManage.js";
import modeConfig from "../../assets/modelConfig2.json";
import defaultData from "../../assets/baseData";
import Tool from "../../store/DataMapperTools.js";
require("webpack-jquery-ui");
require("webpack-jquery-ui/css");
var htmlToImage = require("html-to-image");

const MaxLength = 2;
var MapperDatas = Tool.CreatNewMapperDatas();
var datamap = d3.map();
$.extend({
  //读取指定csv文件的字段名
  csvtitle: function(url, f) {
    $.get(url, function(record) {
      record = record.split(/\n/);
      var title = record[0].split(",");
      for (var i = 0; i < title.length; i++) {
        title[i] = title[i].trim();
      }
      record.shift();
      var data = [];
      for (var i = 0; i < record.length; i++) {
        var t = record[i].split(",");
        for (var y = 0; y < t.length; y++) {
          if (title[y] == "date") {
            var sure = false;
            if (new Date(t[y]).getFullYear() == 2012) {
              sure = true;
            }
            if (!sure) {
              break;
            }
          }
          if (!data[i]) data[i] = {};
          data[i][title[y].trim()] = t[y]; //不添加trim函数将导致出现第二个属性名存在空格，trim将前后空格去掉
        }
      }

      ``;
      var titlemap = d3.map();
      for (var i = 0; i < title.length; i++) {
        titlemap.set(
          title[i],
          Number(data[0][title[i].trim()]).toString() == "NaN"
            ? "string"
            : "num"
        );
      }
      var map = d3.map(
        d3
          .nest()
          .key(function(d) {
            return d[title[0]];
          })
          .map(data, d3.map)
      );
      var datas = {
        title: title,
        data: data,
        map: map,
        titlemap: titlemap
      };
      f.call(this, datas);
    });
  }
});
$.csvtitle("../../../static/data/seattle-weather.csv", function(datas) {
  datamap.set("Weather", datas);
  console.log(datas)
  store.commit('commitDataInfoStore', {'name': 'Weather', 'titlemap': datas.titlemap.entries(), 'dataTypes': [...new Set(datas.titlemap.values())]})
  add(datas.title, "Weather");
});
$.csvtitle("../../../static/data/testdata.csv", function(datas) {
  datamap.set("Week", datas);
  store.commit('commitDataInfoStore', {'name': 'Week', 'titlemap': datas.titlemap.entries(), 'dataTypes': [...new Set(datas.titlemap.values())]})
  add(datas.title, "Week");
});
//name为表名，或者state存储的data数据昵称
function add(data, name) {
  var s = name;
  var x = 0;
  var adds = d3
    .select("#staticdata ul")
    .append("li")
    .attr("class", "dropdown");
  adds
    .append("a")
    .attr("data-toggle", "dropdown")
    .text(name)
    .append("i")
    .attr("class", "icon-arrow");
  //将csv数据中的字段显示出来
  var tables = adds
    .append("ul")
    .attr("class", "dropdown-menu")
    .append("table")
    .attr("class", s);
  var thead = tables.append("thead").append("tr");
  thead.append("th").text("name");
  thead.append("th").text("type");
  thead.append("th").text("oper");
  thead.append("th").text("group");
  tables.append("tbody");

  for (var i = 0; i < data.length; i++) {
    var perv = null;
    var groubv = "&nbsp" + null;
    // if (datamap.get(s).titlemap.get(data[i]) == "string") {
    perv =
      "<select class='selectper' style='fontsize: 10px !important;'>" +
      "<option value ='null'>null</option>" +
      "<option value ='count'>count</option>" + //count计算条数
      "<option value='avg'>avg</option>" + //avg是计算的平均值
      "<option value='sum'>sum</option>" + //计算和
      "</select>";
    groubv = "<select class='selectgro'><option value='null'>null</option>";
    var keys = datamap.get(s).title;
    for (var j = 0; j < keys.length; j++) {
      groubv += "<option value=" + keys[j] + ">" + keys[j] + "</option>";
    }
    groubv += "</select>";
    //  }
    /**
     * 将字段名设置为表格每行的类名，将所属的数据表名，赋值为每行的value
     */

    var $tr = $(
      "<tr class=" +
        data[i] +
        " value=" +
        s +
        "><td>" +
        data[i] +
        "&nbsp</td><td>" +
        datamap.get(s).titlemap.get(data[i]) +
        "&nbsp</td><td>" +
        perv +
        "</td><td>" +
        groubv +
        "</td></tr>"
    );
    $("#staticdata ." + s + " tbody").append($tr);
  }
  $("#staticdata ." + s + " tbody")
    .children()
    .draggable({
      appendTo: "body",
      helper: "clone",
      scope: "ss",
      start: function() {
        d3.select("body .ui-draggable-dragging")
          .style("z-index", 999)
          .style("display", "table")
          .style("table-layout", "fixed");

        var c = $("body .ui-draggable-dragging")
          .attr("class")
          .split(" ");
        //将被克隆的元素状态全部复制给克隆元素
        var dragclass = c[0];
        var oper = $("#staticdata ." + dragclass + " .selectper").val();
        var groubs = $("#staticdata ." + dragclass + " .selectgro").val();
        $("body .ui-draggable-dragging .selectper").val(oper);
        $("body .ui-draggable-dragging .selectgro").val(groubs);
      },
      stop: function() {
        var c = $("body .ui-draggable-dragging")
          .attr("class")
          .split(" ");

        var dragclass = c[0];
        var tablename = $("body .ui-draggable-dragging").attr("value");
        var oper = $("body .ui-draggable-dragging .selectper").val();
        var gro = $("body .ui-draggable-dragging .selectgro").val();
        var top = $("body .ui-draggable-dragging").position().top;
        var left = $("body .ui-draggable-dragging").position().left;
        var width = $("body .ui-draggable-dragging").width();
        var height = $("body .ui-draggable-dragging").height();
        var maxleft = left + width;
        var maxtop = top + height;
        if (oper != "null" && gro == "null") {
          alert("please select group");
          return;
        } else {
          if (gro != "null" && oper == "null") {
            alert("please select oper");
            return;
          }
        }
        store.state.propsData =
          store.state.chartArray[store.state.selectChartId].baseData;
        if (
          store.state.chartArray[store.state.selectChartId].baseData
            .mapperdatas != null
        )
          MapperDatas =
            store.state.chartArray[store.state.selectChartId].baseData
              .mapperdatas;
        if (!$("#y").is(":visible") && !$("#x").is(":visible")) {
          return;
        } else {
          if ($("#x").is(":visible") && !$("#y").is(":visible")) {
            var twotargetTop = $("#x").position().top;
            var twotargetleft = $("#x").position().left;
            var twotargetMaxTop = $("#x").position().top + $("#x").height();
            var twotype = $($($("#x").children()[1]).children()[0])
              .text()
              .split(":");

            var twoinputf = $($("#x input")[0]);
            var twoinputs = $($("#x input")[1]);

            var dragtype = $($("body .ui-draggable-dragging").children()[1])
              .text()
              .toString();

            if (
              twotargetTop <= top &&
              twotargetMaxTop > top &&
              (twotargetleft >= left && twotargetleft < maxleft)
            ) {
              var Mapperdata = Tool.getDataMapper(
                tablename,
                dragclass,
                oper,
                gro
              );
              if (dragtype.search(twotype[1]) == 0) {
                MapperDatas.set(twotype[1], Mapperdata);
                Tool.SetInputval(twoinputf, Mapperdata);
                if (store.state.propsData.datamappers != null) {
                  var set = store.state.propsData.datamappers[0];
                  Tool.SetMapfromAndAlias(set, Mapperdata);
                }
                twoinputs.val(Mapperdata.fieldname);
              }
              if (twoinputf.val().length > 0) {
                // console.log("拖拽完成:");
                mapperdataM.setdatamap(datamap);
                mapperdataM.setmapperdata(MapperDatas);
                //  mapperdataM.startanalyzedata();
              }
            }
          } else {
            var onetargetTop;
            var onetargetleft;
            var onetargetMaxtop;
            var onetype;
            var oneinputf;
            var oneinputs;

            onetargetTop = $("#y").position().top;
            onetargetleft = $("#y").position().left;
            onetargetMaxtop = $("#y").position().top + $("#y").height();
            onetype = $($($("#y").children()[1]).children()[0])
              .text()
              .split(":");
            oneinputf = $($("#y input")[0]);
            oneinputs = $($("#y input")[1]);

            var twotargetTop = $("#x").position().top;
            var twotargetleft = $("#x").position().left;
            var twotargetMaxTop = $("#x").position().top + $("#x").height();
            var twotype = $($($("#x").children()[1]).children()[0])
              .text()
              .split(":");

            var twoinputf = $($("#x input")[0]);
            var twoinputs = $($("#x input")[1]);

            var dragtype = $($("body .ui-draggable-dragging").children()[1])
              .text()
              .toString();

            if (
              onetargetTop <= top &&
              onetargetMaxtop > maxtop &&
              (onetargetleft >= left && onetargetleft < maxleft)
            ) {
              var Mapperdata = Tool.getDataMapper(
                tablename,
                dragclass,
                oper,
                gro
              );

              if (dragtype.search(onetype[1]) == 0) {
                MapperDatas.set(onetype[1], Mapperdata);
                Tool.SetInputval(oneinputf, Mapperdata);
                if (store.state.propsData.datamappers != null) {
                  var set = store.state.propsData.datamappers[0];
                  if (set.Fieldtype != onetype)
                    set = store.state.propsData.datamappers[1];
                  Tool.SetMapfromAndAlias(set, Mapperdata);
                }

                oneinputs.val(Mapperdata.fieldname);
              }
            }

            if (
              twotargetTop <= top &&
              twotargetMaxTop > top &&
              (twotargetleft >= left && twotargetleft < maxleft)
            ) {
              var Mapperdata = Tool.getDataMapper(
                tablename,
                dragclass,
                oper,
                gro
              );
              if (dragtype.search(twotype[1]) == 0) {
                MapperDatas.set(twotype[1], Mapperdata);
                Tool.SetInputval(twoinputf, Mapperdata);

                if (store.state.propsData.datamappers != null) {
                  var set = store.state.propsData.datamappers[1];
                  if (set.Fieldtype != twotype)
                    set = store.state.propsData.datamappers[0];
                  Tool.SetMapfromAndAlias(set, Mapperdata);
                }

                twoinputs.val(Mapperdata.fieldname);
              }
            }

            if (twoinputf.val().length > 0 && oneinputf.val().length > 0) {
              // console.log("拖拽完成:");
              mapperdataM.setdatamap(datamap);
              mapperdataM.setmapperdata(MapperDatas);
              MapperDatas = Tool.CreatNewMapperDatas();
              //  mapperdataM.startanalyzedata();
            }
          }
        }
      }
    });
  clickdata();
}
var imgArrayone = [
  {
    id: 0,
    idView: require("../../../static/Image/barchart.png"),
    chartType: "barChart"
  },
  {
    id: 1,
    idView: require("../../../static/Image/linechart.png"),
    chartType: "linechart"
  },
  {
    id: 2,
    idView: require("../../../static/Image/piechart.png"),
    chartType: "piechart"
  }
];
var imgArraytwo = [
  // {
  //   id: 3,
  //   idView: require("../../../static/Image/Funnelplot.png"),
  //   chartType: "funnelPlot"
  // },
  {
    id: 4,
    idView: require("../../../static/Image/scatter_vega.png"),
    chartType: "scatter_vega"
  },
  {
    id: 5,
    idView: require("../../../static/Image/canlendar.png"),
    chartType: "canlendar"
  }
];
export default {
  name: "ChartStore",
  data() {
    return {
      imgArrayone,
      imgArraytwo
    };
  },
  methods: {
    createClone: function(e, chartType, type) {
      $(e.currentTarget)
        .clone(true)
        .appendTo("#app .el-main")
        .attr("id", "clone")
        .css("position", "absolute")
        .css("height", "200px")
        .css("width", "200px")
        .css("top", function() {
          var y = $(e)[0].clientY + 60 + "px";
          return y;
        })
        .css("left", "15%");
      $(e.currentTarget).draggable({
        appendTo: "#app .el-main",
        start: function() {
          $("#app .el-main .ui-draggable")
            .css("width", "200px")
            .css("height", "200px");
        },
        drag: function(event, ui) {
          var maxleft = $("#app .el-main").width();
          var top =
            $("#app .el-main .ui-draggable-dragging").position().top -
            $("#app .el-menu-demo").height();
          var left =
            $("#app .el-main .ui-draggable-dragging").position().left -
            $("#app .el-aside").width();
          d3.select("#app .el-main .ui-draggable-dragging").style(
            "z-index",
            function() {
              if (top < 0 || left < 0) {
                return -1;
              }
              if (
                left + $("#app .el-main .ui-draggable-dragging").width() >
                maxleft
              ) {
                return -1;
              }
              return 1;
            }
          );
        },
        helper: "clone",
        scope: "ss",
        stop: function(e) {
          var top =
            $("#app .el-main .ui-draggable-dragging").position().top -
            $("#app .el-menu-demo").height();
          var left =
            $("#app .el-main .ui-draggable-dragging").position().left -
            $("#app .el-aside").width();

          console.log(chartType);
           var testarry=$.extend(true,[],defaultData);
          var item = {
            // chartname:chartType,
           
            chartname: chartType,
            baseData: testarry[chartType].baseData,
            x: 0,
            y: 0,
            w: 4,
            h: 8,
            i: stores.state.chartArray.length,
            static: false,
            j: "item" + stores.state.chartArray.length,
            color: "#f7f7f7"
          };
          // console.log(defaultData);
          // console.log(testarry);
          // console.log(item)
          mutations.addToArray(stores.state, item);
          console.log(stores.state.chartArray)
        }
      });
    },
    deletClone: function(e) {
      d3.selectAll("#clone").remove();
    },
    saveOption: function() {
      let that = this;
      htmlToImage
        .toPng(document.getElementById("screenShot"))
        .then(function(dataUrl) {
          var img = dataUrl,
            data = img.replace(/^data:image\/\w+;base64,/, ""),
            buf = new Buffer(data, "base64"),
            random = Math.floor(Math.random() * 100);

          var sendData = {
            image: {
              name: "image" + random + ".png",
              data: buf
            },
             chartArray: {
              name: "chartArray" + random + ".json",
              data: that.$store.state.chartArray
            }
          };

          axios.post("http://localhost:3000/saveOption", sendData, function(
            callback
          ) {
            console.log(callback);
          });
        })
        .catch(function(error) {
          console.error("oops, something went wrong!", error);
        });
    }
  },
  watch: {}
};

function clickdata() {
  var dropdown = document.querySelectorAll(".dropdown");
  var dropdownArray = Array.prototype.slice.call(dropdown, 0);
  dropdownArray.forEach(function(el) {
    var button = el.querySelector('a[data-toggle="dropdown"]'),
      menu = el.querySelector(".dropdown-menu"),
      arrow = button.querySelector("i.icon-arrow");

    button.onclick = function(event) {
      if (!menu.hasClass("show")) {
        menu.classList.add("show");
        menu.classList.remove("hide");
        arrow.classList.add("open");
        arrow.classList.remove("close");
        event.preventDefault();
      } else {
        menu.classList.remove("show");
        menu.classList.add("hide");
        arrow.classList.remove("open");
        arrow.classList.add("close");
        event.preventDefault();
      }
    };
  });
  Element.prototype.hasClass = function(className) {
    return (
      this.className &&
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className)
    );
  };
}
</script>

<style>
@import "../../../static/css/selectData.css";
#Store img {
  width: 100px;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
#staticdata table {
  border-spacing: 0;
  border-collapse: collapse;
  text-align: center;
  width: 100%;
}
#staticdata table tbody {
  display: block;

  overflow-y: hidden;
  overflow-x: hidden;
}
#staticdata table thead,
#staticdata tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

#staticdata table thead {
  width: calc(100% - 0.1em);
}

#staticdata table td {
  word-wrap: break-word;
  font: 10px Microsoft YaHei;
}
#staticdata table thead th {
  background: #ccc;
}
#Store .el-collapse-item .el-collapse-item__header {
  text-align: center;
  font: 12px Microsoft YaHei;
}
.el-collapse-item__header{
  padding-left: 10% !important;
}
.dropdown-menu th{
  font-size:10px !important;
}
</style>

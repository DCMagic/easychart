<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item
      v-for="(value, key) in baseData"
      :key="key"
      :title="key"
      :name="key"
      v-show="collapseShow(key)"
    >
      <div v-for="(val, k) in value" :key="k">
        <div v-if="key =='MetaConfig'" >
          <span>{{k}}</span>
          <el-input v-model="value.title" size="mini" v-if="value.hasOwnProperty('title')"></el-input>
        </div>

        <div v-if="key =='style'">
          <span>{{k}}</span>
          <div>
            <div v-if="k==='backgroundColor'">
              <el-input class="colorInput" v-model="value.backgroundColor" size="mini"></el-input>
              <el-color-picker v-model="value.backgroundColor" size="mini"></el-color-picker>
            </div>
            <div v-if="k==='fontColor'">
              <el-input class="colorInput" v-model="value.fontColor" size="mini"></el-input>
              <el-color-picker v-model="value.fontColor" size="mini"></el-color-picker>
            </div>
          </div>
          <div v-for="(v, i, index) in val" :key="index">
            <el-input
              class="colorInput"
              v-model="val[i]"
              size="mini"
              v-if="value.hasOwnProperty('color')"
            ></el-input>
            <el-color-picker v-model="val[i]" size="mini" v-if="value.hasOwnProperty('color')"></el-color-picker>
          </div>
        </div>

        <div v-if="key =='datamappers'" :id="getDatamappersId(k)">
          <div v-for="(v, i, index) in val" :key="index">
            <span v-if="i=='Fieldname'||i=='Fieldtype'">{{i}}:{{v}}</span>
            <div v-if="i=='Mapfrom'">
              <span>{{i}}</span>
              <el-input v-model="val.Mapfrom" size="mini"></el-input>
            </div>
            <div v-if="i=='Alias'">
              <span>{{i}}</span>
              <el-input v-model="val.Alias" size="mini"></el-input>
            </div>
          </div>
          <el-divider v-if="k==0"></el-divider>
        </div>
      </div>

      <div v-if="key =='data' && value.length !== 0">
        <v-table
          v-if="value[0].hasOwnProperty('name')"
          column-width-drag
          :table-data="value"
          :columns="columnsName"
          :cell-edit-done="cellEditDone"
          style="width:100%"
        ></v-table>
        <v-table
          v-if="value[0].hasOwnProperty('x')"
          column-width-drag
          :table-data="value"
          :columns="columnsX"
          :cell-edit-done="cellEditDone"
          style="width:100%"
        ></v-table>
        <v-table
          v-if="value[0].hasOwnProperty('item')"
          column-width-drag
          :table-data="value"
          :columns="columnsItem"
          :cell-edit-done="cellEditDone"
          style="width:100%"
        ></v-table>
        <v-table
          v-if="value[0].hasOwnProperty('date')"
          column-width-drag
          :table-data="value"
          :columns="columnsDate"
          :cell-edit-done="cellEditDone"
          style="width:100%"
        ></v-table>
        <v-table
          v-if="value[0].hasOwnProperty('city')"
          column-width-drag
          :table-data="value"
          :columns="columnsCity"
          :cell-edit-done="cellEditDone"
          style="width:100%"
        ></v-table>
      </div>
      <div v-if="key == 'button'">
        <el-button v-on:click="sendIsActive(value.method)" size="small">{{value.title}}</el-button>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
import { mapGetters } from "vuex";
import mapperdataM from "../../store/MapperDataManage.js";
export default {
  name: "settingside",
  data() {
    return {
      baseData: {
        MetaConfig: {
          title: ""
        },
        style: {
          color: []
        },
        data: [],
        datamappers: [
          {
            Fieldname: "value",
            Fieldtype: "num",
            Mapfrom: null,
            Alias: null
          },
          {
            Fieldname: "name",
            Fieldtype: "string",
            Mapfrom: null,
            Alias: null
          }
        ]
      },

      activeNames: ["MetaConfig", "style", "data", "button", "datamappers"], //折叠面板

      columnsName: [
        {
          field: "name",
          title: "name",
          width: 100,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        },
        {
          field: "value",
          title: "value",
          width: 100,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        }
      ],
      columnsX: [
        {
          field: "x",
          title: "x",
          width: 100,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        },
        {
          field: "y",
          title: "y",
          width: 100,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        }
      ],
      columnsItem: [
        {
          field: "item",
          title: "item",
          width: 100,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        },
        {
          field: "count",
          title: "count",
          width: 100,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        }
      ],
      columnsDate: [
        {
          field: "date",
          title: "date",
          width: 120,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        },
        {
          field: "value",
          title: "value",
          width: 80,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        }
      ],
      columnsCity: [
        {
          field: "time",
          title: "time",
          width: 120,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        },
        {
          field: "temperature",
          title: "value",
          width: 80,
          titleAlign: "center",
          columnAlign: "center",
          isEdit: true,
          isResize: true
        }
      ]
    };
  },
  mounted(){
  },
  computed: {
    // ...mapGetters({ storeBaseData: "getPropsData" }),
    ...mapGetters({ isClick: "getIsActive" }),
    ...mapGetters({ selectChartId: "getSelectChartId"}),
  },
  watch: {
    // baseData: {
    //   handler(newVal) {
    //     this.$store.commit("commitPropsData", newVal);
    //   },
    //   deep: true
    // },
    // storeBaseData: {
    //   handler(newVal) {
    //     this.baseData = newVal;
    //   },
    //   deep: true
    // },
    selectChartId: {
      handler(newVal){
         if(newVal === "dashboard"){
          this.baseData = this.$store.state.dashboardData.baseData
        } else {
          this.baseData = this.$store.state.chartArray[newVal].baseData
        }
      }
    }
  },
  methods: {
    cellEditDone(newValue, oldValue, rowIndex, rowData, field) {
      this.baseData.data[rowIndex][field] = newValue;
    },
    sendIsActive(key) {
      if (key == "dashboard") {
        this.$store.commit("commitIsActive", !this.isClick);
      } else if (key == "startanalyzedata") {
        mapperdataM.startanalyzedata(); //不知道是否在这里用
      }
    },
    getDatamappersId(a) {
      if (a % 2) return "y";
      else return "x";
    },
    collapseShow(key) {
      return (key == "MetaConfig" ||key == "style" ||(key == "data" && this.baseData.data.length != 0)||key == "button" ||key == "datamappers");
    }
  }
};
</script>
<style>
.el-input {
  width: 100%;
  /* float: right; */
}
.colorInput {
  width: 100px;
  float: left;
}
.el-collapse-item__content {
    font-size: 10px !important;
    color: black !important;
}
.el-input__inner{
  width: 80% !important;
}
.colorInput {
  padding-left: 10px !important;
}
</style>

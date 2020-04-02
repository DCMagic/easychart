<template>
    <el-menu
    :default-active="activeIndex2"
    class="el-menu-demo"
    mode="horizontal" 
    @select="handleSelect"
    background-color="rgb(60,60,60)"
    text-color="grey"
    active-text-color="#fff">
    
    <!-- <el-menu-item style="width:10px"></el-menu-item> -->
    <div style="padding-top:10px; padding-left:1.5%">
      <p style="color:white; text-align:left; font-weight:600; font-size:20px">OpenVisConnector</p>
    </div>
    <div calss="left-button" >
      <!-- style="width:300px;position: absolute;top:14%;left:11%" -->
      
    </div>
    <div  calss="right-button"  style="width:600px;position: absolute;top:14%;right:-6%">
      <el-tooltip effect="dark" content="Click Save" placement="bottom">
        <el-button type="info"  @click="saveOption" size="small" icon="el-icon-edit"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="Edit Interaction" placement="bottom">
        <el-button type="info"  @click="popUp" size="small" icon="el-icon-pie-chart"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="Save As Template" placement="bottom">
        <el-button type="info" @click="open" icon="el-icon-folder-checked" size="small"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="Preview" placement="bottom">
        <el-button type="info" icon="el-icon-view" size="small"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="undo" placement="bottom">
        <el-button type="info" icon="el-icon-d-arrow-left" size="small"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="redo" placement="bottom">
        <el-button type="info" icon="el-icon-d-arrow-right" size="small"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="delete" placement="bottom">
        <el-button type="info" icon="el-icon-delete" size="small"></el-button>
      </el-tooltip>
    </div>
    <!-- <el-menu-item index="4" style="padding-left:83%">
        <img src="../../assets/biscuits.svg" style="width:35px" alt="" />
    </el-menu-item> -->
    
    
    </el-menu>
</template>
<script>
var htmlToImage = require("html-to-image");
export default {
    name: "navmenue",
    data() {
      return {
        activeIndex2: '1'
      };
    },
    watch:{

    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      popUp: function() {
      this.$store.commit("editInteraction");
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
    },
      open() {
        this.$prompt('请输入模板名称','Save' ,{
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          // inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
          // inputErrorMessage: '模板名称不正确'
        }).then(({ value }) => {
          this.$message({
            type: 'success',
            message: '模板名是: ' + value
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });
      },
      saveOption: function() {
        console.log("saveOption")
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
      },
      popUp: function() {
        this.$store.commit("editInteraction");
      }
    }
}
</script>
<style>

.left-button {
  margin: 1%;
  opacity: 0.7;
  position: absolute;
  /* left:25%; */
  float: left;
  width: 300px;
}
.right-button {
  float:right;
}
</style>
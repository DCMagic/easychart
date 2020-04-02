<template>
    <div id="blueEditor">
        
        <vs-popup title="Editor" :active.sync="popupActivo4" icon-close="close" style="">
            <div>
                <el-container>
                    <el-aside style="text-align: center;  height: 950px; width:220px; max-height:830px; overflow-x:hidden; overflow-y: scroll">
                        <el-divider content-position="center" style="font-size:16px; color:#333; font-weight:700">Function Panel</el-divider>
                        <div style="padding-top:5%">
                            <vs-row vs-justify="center">
                                <vs-col type="flex" vs-justify="center" vs-align="center" vs-w="12">
                                    
                                    <vs-card>
                                        <div slot="header">
                                            <div content-position="center" style="font-size:16px; color:#333; font-weight:700"> Mouse Action</div>
                                            <div class='con-radios'>
                                                <el-row style="padding-top:10px; padding-left:30px">
                                                <vs-radio v-model="radios" vs-value="Connection" @click="changeMouseActionType('Connection')">Connection</vs-radio>
                                                </el-row>
                                                <el-row style="padding-top:10px; padding-left:30px">
                                                <vs-radio color="success" v-model="radios" vs-value="Filter" @click="changeMouseActionType('Filter')">Filter</vs-radio>
                                                </el-row>
                                                <el-row style="padding-top:10px; padding-left:30px">
                                                <vs-radio color="warning" v-model="radios" vs-value="Highlight" @click="changeMouseActionType('Highlight')">Highlight</vs-radio>
                                                </el-row>
                                            </div>
                                            <el-divider content-position="center" style="font-size:16px; color:#333; font-weight:700"></el-divider>
                                            <div content-position="center" style="font-size:16px; color:#333; font-weight:700">Function</div>
                                                <el-row style="padding-left: 25%">
                                                    <vs-button type="line" color="grey" icon="refresh" @click="refresh">Restart</vs-button>
                                                </el-row>
                                                <el-row style="padding-left: 25%">
                                                    <vs-button type="line" color="grey" icon="delete" @click="deleteSelectedItems()">Delete</vs-button>
                                                </el-row>
                                                <el-row style="padding-left: 25%">
                                                    <vs-button type="line" color="grey" icon="undo" @click="operateStack('back')">Undo</vs-button>
                                                </el-row>
                                            <el-divider content-position="center" style="font-size:16px; color:#333; font-weight:700"></el-divider>
                                            <div content-position="center" style="font-size:16px; color:#333; font-weight:700">Data</div>
                                            <div>
                                                <vs-collapse :key="index1" accordion v-for="(data, index1) in dataButtom">
                                                <vs-collapse-item style="border-radius:10px">

                                                    <div slot="header" style="color:'#808080'; border-left:black solid 2px;font-size:15px">
                                                        {{data.name}}
                                                    </div>

                                                    <div :key="index2" v-for="(dim, index2) in data.titlemap">
                                                        <vs-list-item>
                                                            <p style="float:left;color:grey">{{dim.key}}</p>
                                                            <vs-select style="float:left;width:60%" v-model="dim.value">
                                                                <vs-select-item :key="index" :value="item" :text="item" v-for="(item, index) in data.dataTypes" />
                                                            </vs-select>
                                                            <vs-avatar style="float:right;margin:0px;margin-left:10px; background:rgb(167,189,255)" text="+" v-on:click="dataComponentHandler(data.name, dim)"/>
                                                        </vs-list-item>
                                                    </div>
                                                </vs-collapse-item>
                                            </vs-collapse>
                                            </div>
                                            

                                        </div>
                                    </vs-card>
                                </vs-col>
                            </vs-row>
                        </div>
                    </el-aside>

                    <el-container style="padding-left:1%">
                        <el-header style="height:50px">
                            <el-row>
                                <el-divider content-position="center" style="font-size:16px; color:#333; font-weight:700">Editor Panel</el-divider>
                            </el-row> 
                        </el-header>
                        <el-main>
                            <div id='preview' style="background:rgba(0,0,0,0.05); box-shadow:0 2px 12px 0 rgba(0,0,0, 0.1)">
                                <div class="panelButtons" style="position:absolute; padding:1%">
                                    <!--
                                        <vs-button radius color="primary" type="filled" icon="delete" @click="deleteSelectedItems()"></vs-button>
                                        <vs-button radius color="primary" type="filled" icon="undo" @click="operateStack('back')" style="transform:translate(15px)" ></vs-button>
                                    -->
                                </div>
                                <svg id ='blueditorboard'></svg>
                            </div>
                        </el-main>
                    </el-container>
                </el-container>
            </div>
        </vs-popup>
    </div>
</template>
<script>
import * as d3 from 'd3'
import BlueprintLine from "./blueprintLine"
import BlueComponent from "./blueComponent"
import modelConfig from "../../assets/modelConfig2.json"
import blueComponentTypes from "../../assets/blueComponentTypes.json"
import dashboardVue from '../dashboard/dashboard.vue';
import axios from "axios";
export default {
    name:'blueEditor',
    data(){
        return{
            buttonclosehidden:true,
            activeNames: ['0'],
            container: "", //canvas to drawing blueprint
            componentTypes: blueComponentTypes, // components' types of blueprint
            modelConfig: modelConfig, //configuration detail of each component model
            comChartCount:{}, // chart count -> distinguish chart
            blueComponentsTypeCount:{}, //store the count of component according to different type
            dataComponent: {}, //The exsiting components in canvas (used to check the exsiting)
            blueComponents: [], //The exsiting components in canvas (used to store the exsiting)
            selectedData: {}, //The dimensions in dataset which been selected by user
            loadedDatasets:{}, //accroding datacomponent to loaded datasets
            width: null,
            height: null,
            drawingLine: null, //The line which is being darwing by user,
            blueLines: [], //Store the connections between component which connected by curve
            mouseAction: "", //mouse action label which used to change the mouse action state
            exstingPorts:[], //all of the component port in blueprint
            lineColor:{
                "Chart": "#967ADC",
                "Caculator": "#37BC9B",
                "Layout": "#37BC22",
                "Data": "#F6BB42"
            },
            blueLinesDelSignal:false, //true has been delete
            chartLayout:{}, //layout is the preset typesetting
            chartLayoutObj:{}, //更新chartLayoutObj 用于存储layout-port-config
            blueComponentNameList:[], //the index made of componentid
            componentGraph:[],
            vegaObjectObj:{}, //vegaobject is used to generate graph throgh
            chartData:{}, //store the data in different chart
            controlComponentCount:{
                "controler": 0,
                "controlled": 0,
                "curler": 0,
                "curled": 0,
                "data": 0
            },
            dataMapper:{},
            lastBlueLines:[],
            blueLinesName:[], // store the links between components,
            mouseActionType:{
                "text":'Attribute Mapping',
                "color": "#838DFF",
                "index": 1
            },
            h5Style:{
                'background':"#838DFF",
                'border-radius': '7px',
                "transition": "all .5s ease"
            },
            radios:'Connection',
            dragble:{
                "flag": false,
                "startLoc": [],
                "endLoc": [],
                "clickTime": [],

            },
            operationStack:[],
            backStatus: false,
            ///////
            dataButtom:[]
            
        }
    },
    computed:{
        popupActivo4 :{
            get: function(){
                return this.$store.state.popUp
            },
            set: function(){
                this.$store.commit("editInteraction")
            }
        },
        _components: {
            get: function(){
                return this.$store.getters.getChartComponentArray
            },
            set: function(){

            }
        },
        dataInfoStore: {
            get: function(){
                return this.$store.state.dataInfoStore
            },
            set: function(){

            }
        }

    },
    watch:{
        popupActivo4: {
            handler(val, oldVal){
                if(val == false){
                    this.close()
                }
            }
        },
        //Monitor the positon's change of component
        blueComponents: {
            handler(curVal, oldVal) {
                let that = this
                if(curVal.length == oldVal.length){
                for (let i = 0; i < this.blueComponents.length; i++){
                    if(this.blueComponents[i].isDelete){
                        let comid = this.blueComponents[i].getId(),
                            obj = this.blueComponents[i].getObj()
                        that.deleteComponent({"status": 0, "options": {"comid": comid}})
                        if(that.backStatus == false){
                            that.operateStack("go", "01", {"id": comid, "comobj": obj})
                        } else {
                            that.operateStack = false
                        }
                        break;
                    }
                    
                    let curEle = curVal[i];
                    let preEle = oldVal[i];
                    //Obtain the newest postion of each component
                    let curPos = curEle.getPos();
                    let prePos = preEle.getPos();

                    if(this.blueLines.length > 0){
                        this.blueLines.forEach(function(line, i){
                            //寻找与组件相关的blueLines
                            let connectInfo = line.getConnectInfo()
                            if(connectInfo.sourceId == curEle.getId() || connectInfo.targetId == curEle.getId()){
                                line.parentPosUpdated(
                                    curPos.dx, //delta of horizon postion
                                    curPos.dy, //delta of vertical position
                                    curEle.inPorts,
                                    curEle.outPorts,
                                    curEle.id
                                )
                            }
                            curEle.resetDeltaPos();
                            preEle.resetDeltaPos();
                        })
                    }
                }
                }
            },
            deep: true
        },

        //Monitor the bluelines' length, if length increased, the new connection will be parsed
        blueLines: {
            handler(curVal, oldVal) {
                let that = this

                if(that.blueLinesDelSignal == true){
                    // deleted blueprint line has been removed
                    // update bluegraph map using option 'afterdelete'
                    // turn blueLinesDelSignal to false
                    that.blueLinesDelSignal = false
                    that.catchConnect("afterdelete")
                    that.lastBlueLines = []
                    curVal.forEach(d => {
                        that.lastBlueLines.push(d)
                    })
                }else if(that.blueLinesDelSignal == false){
                    if(curVal.length > that.lastBlueLines.length && curVal.length != 0){
                        //add line
                        that.catchConnect("add")
                    }
                    if(curVal.length < that.lastBlueLines.length){
                        //delete line
                        if(curVal.length == 0){
                        // empty relative items
                            this.catchConnect("empty")
                        }else{
                            this.catchConnect("delete")
                        }
                    }
                    that.lastBlueLines = []
                    curVal.forEach(d => {
                        that.lastBlueLines.push(d)
                    })
                }
            }
        },

        _components : {
            handler(val, oldVal){
                this.addBlueComponent(val[val.length-1])
            },
            deep:true
        },
        radios: {
            handler(val, oldVal){
                this.changeMouseActionType(val)
            },
            deep:true
        },
        dataInfoStore:{
            handler(val, oldVal){
                if(val.length > this.dataButtom.length){
                    this.dataButtom.push(val[val.length-1])
                    console.log(this.dataButtom)
                }
            },
            deep: true
        }
    },
    methods:{
        test: function(){
            console.log("test")
        },
        close: function(){
            let that = this
            let controlerCom = [],
                dMapper = [],
                select_config = []

            that.blueLines.forEach((d,i) => {
                let source_id = d.getst().sourceId
                controlerCom.push(source_id)
            })

            controlerCom = Array.from(new Set(controlerCom)) //duplicate
            controlerCom.forEach((d,i) => {
                let com = that.getComponentById(d),
                    obj = com.getObj()
                    console.log(obj)
                select_config.push({
                        "chartId": d,
                        "type": obj.name,
                        "data": "weather",
                        "FiledName": "weather",
                        "controllee":[]
                    })
            })

            that.blueLines.forEach((d,i) => {
                let _lineInfo = d.getst(),
                    _source_Id = _lineInfo.sourceId,
                    _target_Id = _lineInfo.targetId,
                    _source_port = _lineInfo.sourcePort.text,
                    _target_port = _lineInfo.targetPort.text,
                    _type = _lineInfo.targetPort.parent,
                    _action = _lineInfo.actionTypeIndex
                
                select_config.forEach((v,j) => {
                    if(v.chartId == _source_Id){
                        v.controllee.push({
                            "chartId": _target_Id,
                            "type": _type,
                            "action": _action,
                            "source": _source_port,
                            "target": _target_port
                        })
                    }
                })
            })
            this.$store.commit("updateDataMapper", select_config)
            //this.$store.commit("editInteraction")
            return 1;
        },
        calculator(option){
        },
        chartInit(container, props) {
            let that = this;
            let bluecomponentscountInit = function(that){
                //init blue componets counts
                for(const key in that.componentTypes){
                if(key == "Chart"){
                    that.componentTypes[key]["childrens"].forEach( (d,i) => {
                    if(!that.comChartCount.hasOwnProperty(d)){
                        that.comChartCount[d] = 0
                    }
                    })
                }
                if(!that.blueComponentsTypeCount.hasOwnProperty(key)){
                    that.blueComponentsTypeCount[key] = 0
                    }
                }
            }
            
            this.container = d3.select("#blueditorboard");
            this.container.append("g").attr("id", "grid_layer");
            this.chartResize(window.innerWidth * 0.765, window.innerHeight * 0.843);
            bluecomponentscountInit(that)
            this.containerListener()
        },
        //Resize the canvas after window's size has been updated
        chartResize(innerWidth, innerHeight) {
            let that = this
            //let height = innerHeight > innerWidth * 2 ? innerWidth * 2 : innerHeight;
            //let width = innerWidth;
            this.width = innerWidth * 0.8;
            this.height = innerHeight * 0.85;

            let drawGrids = function(that){
                //Darwing the grids line in canvas which help user the recognize the canvas and components        
                let lineData = [];
                for (let i = 10; i < that.width; i += 20) {
                    lineData.push({ x1: i, y1: 0, x2: i, y2: that.height });
                }

                for (let i = 10; i < that.height; i += 20) {
                    lineData.push({ x1: 0, y1: i, x2: that.width, y2: i });
                }

                if (that.container != "") {
                    that.container
                        .select("#grid_layer")
                        .selectAll("*")
                        .remove();

                        that.container
                        .select("#grid_layer")
                        .selectAll(".grid_lines")
                        .data(lineData)
                        .enter()
                        .append("line")
                        .attr("x1", d => d.x1)
                        .attr("x2", d => d.x2)
                        .attr("y1", d => d.y1)
                        .attr("y2", d => d.y2)
                        .attr("stroke", "#00000030");
                    }
            }

            d3.select("#blueditorboard")
                .attr("width", this.width)
                .attr("height", this.height);

            drawGrids(that);
        },
        //container listener
        containerListener(){
            //distinguish click and dblclick
            let that = this
            function deleteSingleLine() {
                that.drawingLine.remove()
                that.blueLines.pop()
                that.mouseAction == ""
                that.container.on("mousemove", null)
            }

            function highlightCom(range){
                
            }
            let svg = d3.select("#blueditorboard")
            let rect = svg.append("rect")
                .attr("width", 0)
                .attr("height", 0)
                .attr("fill", "rgba(33,20,50,0.3)")
                .attr("stroke", "#ccc")
                .attr("stroke-width", "2px")
                .attr("transform", "translate(0,0)")
                .attr("id", "squareSelect");
                
            svg.on("mousedown.drag", function(d){
                that.dragble.flag = true
                rect.attr("transform", "translate(" + d3.event.layerX + "," + d3.event.layerY + ")");
                that.dragble.startLoc = [d3.event.layerX, d3.event.layerY];
            })
            svg.on("mousemove.drag", function(d){
                if (d3.event.target.localName == "svg" && that.dragble.flag == true || d3.event.target.localName == "rect" && that.dragble.flag == true) {
                    var width = d3.event.layerX - that.dragble.startLoc[0];
                    var height = d3.event.layerY - that.dragble.startLoc[1];
                    if (width < 0) {
                        rect.attr("transform", "translate(" + d3.event.layerX + "," + that.dragble.startLoc[1] + ")");
                    }
                    if (height < 0) {
                        rect.attr("transform", "translate(" + that.dragble.startLoc[0] + "," + d3.event.layerY + ")");
                    }
                    if (height < 0 && width < 0) {
                        rect.attr("transform", "translate(" + d3.event.layerX + "," + d3.event.layerY + ")");
                    }
                    rect.attr("width", Math.abs(width)).attr("height", Math.abs(height))
                }
            })

            svg.on("mouseup.drag", function(d){

                if(that.dragble.flag = true){
                    that.dragble.flag = false
                    that.dragble.endLoc = [d3.event.layerX, d3.event.layerY]
                    let transX = rect.attr("transform").split("translate(")[1].split(',')[0]
                    let transY = rect.attr("transform").split(",")[1].split(")")[0]
                    let range = {
                        "left": +transX,
                        "right": +transX + +rect.attr("width"),
                        "top": +transY,
                        "down": +transY + +rect.attr("height")
                    }

                    rect.attr("width", 0).attr("height", 0)

                    that.blueLines.forEach((d,i) => {
                        let ep = d.getEndPoints(),
                            widthRange = [that.dragble.startLoc[0], that.dragble.endLoc[0]].sort(),
                            heightRange = [that.dragble.startLoc[1], that.dragble.endLoc[1]].sort()

                        if((range.left < ep.sourceX && ep.sourceX < range.right && range.top < ep.sourceY && ep.sourceY < range.down) || 
                            (range.left < ep.targetX && ep.targetX < range.right && range.top < ep.targetY && ep.targetY < range.down)){
                                d.highLight()
                                d.toSelected()
                        }else{
                            if(d.getSelectedStatu() == true){
                                d.dishighLight()
                                d.toSelected()
                            }
                        }
                    })
                    /*
                    that.blueComponents.forEach((d,i) => {
                        let com = d.getComPosition()
                        if(range.left < com.left && com.left < range.right && range.top < com.top && com.down < range.down){
                            d.highlight()
                            d.toSelected()
                        } else {
                            if(d.getSelectedStatu() == true){
                                d.disHightlight()
                                d.toSelected()
                            }
                        }
                    })
                    */
                }
                
            })
            
        },
        deleteSelectedItems(){
            let that = this
            this.deleteLine({"status": 2})
            this.deleteComponent({"status": 1})
        },
        addBlueComponent(com){
            console.log('addBlueComponent', com)
            let that = this,
                _com = null,
                options = {"flag": false, "obj": null}
            if(com.interaction == "controler"){
                that.controlComponentCount['controler'] ++
            }else if(com.interaction == "controlled"){
                that.controlComponentCount['controlled'] ++
            }

            const addClickEvent2Circle = function(that, com){
                //boundind the click event to the circles which represent the ports in component
                //after click the circle, there will new a line in canvas
                com.getAllCircles().on("click", function(d) {
                    let opt = {
                    "com": d, //port
                    "container": that.container,
                    "coverColor": that.mouseActionType.color,
                    "mouseActionType": that.mouseActionType,
                    "id": "blueLines-" + that.blueLines.length
                   }
                that.addLine(opt)
                });
            }
            const constructproperty = function(that, property, name, options){
                let obj = null
                let calculateObj = function(that, tobj, name){
                    //according to this.blueComponentsTypeCount construct id and add 1
                    //make inports outports full
                    //make sure that the viewer name equal to button content
                    let obj = JSON.parse(JSON.stringify(tobj))
                    obj["fill"] = that.componentTypes[obj.type].color;
                    obj["name"] = name;
                    obj['control'] = obj['interaction'];
                    obj['id'] = obj.type + '-' + that.blueComponentsTypeCount[obj.type];

                    if(obj['interaction'] == "controlled"){
                        let gap = window.innerHeight * 0.765 / (that.controlComponentCount["controlled"] + 3)
                        obj['x'] = 750;
                        obj['y'] = 100 + Math.round(gap * that.controlComponentCount["curled"]);
                        that.controlComponentCount["curled"] ++;
                    }else if(obj['interaction'] == "controler"){
                        let gap = window.innerHeight * 0.765 / (that.controlComponentCount["controler"] + 3)
                        obj['x'] = 250;
                        obj['y'] = 100 + Math.round(gap * that.controlComponentCount["curler"]);
                        that.controlComponentCount["curler"] ++;
                    }

                    if(obj.inPorts != undefined){
                        for(let i=0; i<obj.inPorts.length; i++){
                            obj.inPorts[i]["parentX"] = obj['x'];
                            obj.inPorts[i]["parentY"] = obj['y'];
                            obj.inPorts[i]["parent"] = obj['name'];
                            obj.inPorts[i]["parentid"] = obj['id'];
                        }
                    }
                    if(obj.type != "Layout"){
                        //layout do not have layout
                        if(obj.outPorts != undefined){
                            for(let i=0; i<obj.outPorts.length; i++){
                                obj.outPorts[i]["parentX"] = obj['x'];
                                obj.outPorts[i]["parentY"] = obj['y'];
                                obj.outPorts[i]["parent"] = obj['name'];
                                obj.outPorts[i]["parentid"] = obj['id'];
                            }
                        }
                    }else if(obj.type == "Layout"){
                        that.layoutIdName[obj.id] = {}
                        that.layoutIdName[obj.id]["name"] = obj.name
                        that.layoutIdName[obj.id]["ref"] = "msg" + "-" + obj.name.split(" ")[1]
                    }
                    return obj
                }
                if(options.flag == false){
                    obj = calculateObj(that, JSON.parse(JSON.stringify(property)), name)
                } else {
                    obj = JSON.parse(JSON.stringify(options.obj))
                }
                
                
                if(obj.type == "Chart"){
                    let propertiesname = obj.name + "-" + that.comChartCount[obj.name];
                    that.comChartCount[obj.name] = that.comChartCount[obj.name] + 1
                }
                that.blueComponentsTypeCount[obj.type] = that.blueComponentsTypeCount[obj.type] + 1
                _com = new BlueComponent(that.container, obj);
                that.blueComponents.push(_com);
                that.updateDataMapper({
                    "status": 0,
                    "options":{
                        "obj": obj
                    }
                })
                //add stack
                if(that.backStatus == false){
                    that.operateStack("go", "00", {
                        "id": obj.id,
                        "comobj": obj
                    })
                }else{
                    that.backStatus = false
                }
                
                addClickEvent2Circle(that, _com);
            }
            
            if(arguments[1] != undefined){
                options.flag = true
                options.obj = JSON.parse(JSON.stringify(arguments[1]))
            }
            constructproperty(that, that.modelConfig[com["name"]], com["name"], options)
            //that.createNewComponent(com.name)
        },
        deleteComponent(opt){
            // {"status": 0/1, "options": {"comid": comid}}
            // 0 delete assigned component
            // 1 delete selected components
            // in com id
            let that = this
            if(opt["status"] == 0){
                this.blueComponents = this.blueComponents.filter((item) => {
                    if(item.getId() == opt["options"]["comid"]){
                        let obj = item.getObj()
                        that.comChartCount[obj.name] = that.comChartCount[obj.name] - 1
                        that.blueComponentsTypeCount[obj.type] = that.blueComponentsTypeCount[obj.type] - 1
                        item.removeGraph()
                        return false
                    } else {
                        return true
                    }
                })
                delete this.dataMapper[opt["options"]["comid"]]
            } else if(opt["status"] == 1){
                this.blueComponents = this.blueComponents.filter((item) => {
                if(item.getSelectedStatu() == true){
                    item.removeGraph()
                        return false
                    } else {
                        return true
                    }
                })
            } else {
                console.log("error status in deleteComponent")
            }
        },
        addLine(opt){
            /*
            {   
                "com": d,
                "container": that.container,
                "coverColor": coverColor,
                "mouseActionType": that.mouseActionType
            }
            */
            let that = this
            const addLineEvent = function(that){
                //darwing the connection line accroding to the mouse real-time position
                that.container.on("mousemove", function(d) {
                    if (
                        that.mouseAction == "drawing_line" &&
                        that.drawingLine.getConnectInfo()["target"] == ""
                    ){
                        let coordinates = d3.mouse(this);
                        that.drawingLine.dynamicGenerateCurveLine(coordinates);
                        that.drawingLine.findNearestPoint(coordinates, that.exstingPorts);
                    }
                });
            }
            opt.container = that.container

            let line = (that.drawingLine = new BlueprintLine(opt)),
            lineInfo = line.getConnectInfo()
            that.updateDataMapper({
                "status": 1,
                "options":{
                    "lineInfo": lineInfo
                }
            })

            //console.log(line.getConnectInfo())

            if(that.backStatus == false){
                that.operateStack("go", "10", {"comobj": opt })
            } else {
                that.backStatus = false
            }

            this.blueLines.push(line)
            this.mouseAction = "drawing_line";
            this.updateExstingPorts({"status": 0, "options": {"portsType": opt.com.type}})
            addLineEvent(that)
        },
        deleteLine(opt){
            // {"status": 0/1 , options: {"comid": "comid", "linkname": "linkname"}}
            // 0 delete line connected with components
            // 1 delete assigned line
            // 2 delete selected line
            let that = this
            if(opt["status"] == 0){
                this.blueLines = this.blueLines.filter((item) => {
                    let lineinfo = item.getConnectInfo(),
                        _source = lineinfo.sourceId,
                        _target = lineinfo.targetId,
                        linkname = _source + '_' + _target

                    if(opt["options"]["comid"] == _source || opt["options"]["comid"] == _target){
                        item.remove()
                        that.blueLinesName.filter((item2) => {
                            if(item2 == linkname){
                                return false
                            } else {
                                return true
                            }
                        })
                        return false
                    } else {
                        return true
                    }
                })

            } else if(opt["status"] == 1){
                this.blueLines = this.blueLines.filter((item) => {
                    if(item.getId() == opt.id){
                        item.remove()
                        return false
                    } else {
                        return true
                    }
                })
                if(that.backStatus == false){
                    that.operateStack("go", "11", {"comobj": opt})
                } else {
                    that.backStatus = false
                }
                
            } else if(opt["status"] == 2){
                let option = null
                this.blueLines = this.blueLines.filter((item) => {
                    if(item.getSelectedStatu() == true){

                        option = item.getOpt()
                        item.remove()
                        return false
                    } else {
                        return true
                    }
                })
                if(that.backStatus == false){
                    that.operateStack("go", "11", {"comobj": option})
                } else {
                    that.backStatus = false
                }
            }
        },
        updateExstingPorts(opt){
            // 0 updateExstingPorts, 
            // 1 delete assign ports of components
            // {"status": 0/1, "options":{"portsType": inPorts, "comid": comid}}
            let that = this
            
            let func0 = function(opt, that){
                let allPorts = [],
                    portsType = opt["options"]["portsType"]

                that.blueComponents.forEach(function(component,i) {
                    //let ports = component.getAllPorts();
                    let parmas = component.getParmas()
                    let _inPorts = parmas["inPorts"]
                    let _outPorts = parmas["outPorts"]
                    let _id = parmas["id"]
                    if (portsType == "in") {
                        _outPorts.forEach(function(k) {
                            //k.parent = component.id
                            k.id = _id
                            allPorts.push(k);
                        });
                        } else {
                        _inPorts.forEach(function(k) {
                            //k.parent = component.id
                            k.id = _id
                            allPorts.push(k);
                        });
                        }
                });
                that.exstingPorts = []
                that.exstingPorts = allPorts
            }
            let func1 = function(opt, that){
                let comid = opt["options"]["comid"]
                that.exstingPorts = that.exstingPorts.filter((item) => {
                    if(item.parentid == comid){
                        return false
                    } else {
                        return true
                    }
                })
            }

            if(opt["status"] == 0){
                func0(opt, that)
            } else if(opt["status"] == 1){
                func1(opt, that)
            } else {
                console.log("error status in updateExstingPorts")
            }
            
        },
        updateDataMapper(opt){
            // {"status": 0/1, options: {"obj": obj}}
            // 0 add component to datamapper
            // 1 add line to datamapper
            let that = this
            
            if(opt.status == 0){
                let obj = opt.options.obj

                if(obj.hasOwnProperty('inPorts') == true && obj.inPorts.length != 0){
                    let dic = {
                        "name": obj.name,
                        "id": obj.id,
                        "type":obj.type,
                        "control": obj.control,
                        "mapper":[]
                    }
                    obj.inPorts.forEach((d,i) => {
                        dic["mapper"].push({
                            "dataname": d.name,
                            "dataType": "string",
                            "mapfrom": {
                                "operator": null,
                                "source": ''
                            },
                            "alias": null
                        })
                    })

                    that.dataMapper[obj.id] = dic
                }
            } else if(opt.status == 1){
                if(that.dataMapper['line'] == null){
                    that.dataMapper['line'] = []
                } else {
                    that.dataMapper['line'].push(opt.options.lineInfo)
                }
            }

        },
        operateStack(status, operation, option){
            //status : go/back
            /*
            [{
                "operation": '00',
                //00 add component 01 delete component 02 modificate component
                //10 add line 11 delete line 12 modifi line
                "option":{
                    "id": '',
                    "comobj": obj
                }
            },{}]
            */
           let that = this
           if(status == "go"){
               if (operation == "00"){
                   //add bluecomponent
                this.operationStack.push({
                    "operation": "00",
                    "options": {
                        "id": option['id'],
                        "comobj": option["comobj"]
                    }
                })
                } else if (operation == "01"){
                    //delete bluecomponent
                    this.operationStack.push({
                        "operation": "01",
                        "options": {
                            "id": option["id"],
                            "comobj": option["comobj"]
                        }
                    })
                } else if (operation == "02"){
                    //change bluecomponent
                } else if (operation == "10"){
                    //add blueline
                    this.operationStack.push({
                        "operation": "10",
                        "options": {
                            "comobj": option["comobj"]
                        }
                    })
                } else if (operation == "11"){
                    //delete blueline
                    this.operationStack.push({
                        "operation": "11",
                        "options": {
                            "comobj": option["comobj"]
                        }
                    })
                } else if (operation == "12"){
                    //change blueline
                }
           }else if(status == "back"){
               let opt = this.operationStack.pop()
               if (opt.operation == "00"){
                   this.backStatus = true
                   this.deleteComponent({
                       "status": 0,
                       "options": {
                           "comid": opt.options.id
                       }
                   })
               } else if (opt.operation == "01"){
                   this.backStatus = true
                   let interaction = opt["options"]["comobj"]["interaction"],
                        name = opt["options"]["comobj"]["name"]
                   this.addBlueComponent(
                       {"interaction": interaction, "name": name},
                        opt.options.comobj)
               } else if (opt.operation == "02"){

               } else if (opt.operation == "10"){
                   this.backStatus = true
                   this.deleteLine({
                       "status": 1,
                       "options": opt.options.comobj
                   })
               } else if (opt.operation == "11"){
                   this.backStatus = true
                   this.addLine(opt.options.comobj)
               } else if (opt.operation == "12"){

               }
           }
        },
        catchConnect(option){
            // catch ConnectInfo
            let that = this
            let interval = function(con){
                let i = 0;
                let intr = setInterval(function() {
                let conInfo = con.getConnectInfo()
                if (conInfo.targetId != ""){
                    clearInterval(intr);
                    //that.buildBlueGraph(con)
                }
                }, 500)
            }
            let emptyItems = function(){
                that.chartLayout = {}
                that.chartLayoutObj = {}
                that.blueComponentNameList = []
                that.vegaObjectObj = {}
                that.chartData = {}
            }
            let removeDeltedLine = function(){
                let savedLine = []
                that.blueLines.forEach(function(d,i){
                if(d.getConnectInfo().isDeleted == false){
                    savedLine.push(d)
                }
                })
                that.blueLines = savedLine
            }
            if(option == "add"){
                let tailNo = that.blueLines.length - 1;
                interval(that.blueLines[tailNo])
            }else if(option == "delete"){
                //delete removed blueprint line
                that.blueLinesDelSignal = true
                removeDeltedLine()
            }else if(option == "afterdelete"){
                //empty the bluegraph map
                //buildBlueGraph
                emptyItems()
                that.blueLines.forEach(function(d,i){
                interval(d)
                })
            }else if(option == "empty"){
                //empty the bluegraph map
                emptyItems()
            }
        },
        remove(com){
            //find line connected with removedComponent
            //Cancellation bluecomponent and blueline methods: = null / delete in array
            //delete related variable
            let that = this,
                comid = com.getId(),
                comtype = com.getType()
            
            //first removeGraph bluecomponent
            //com.removeGraph()
            //second find connected blueline/ removed graph/ delete in array
            this.deleteLine({"status": 0, "options": {"comid": comid}})

            //third delete component in array
            that.deleteComponent({"status": 0, "options": {"comid": comid}})

            //remove ports
            that.updateExstingPorts({"status": 1, "options": {"comid": comid}})

            if(comtype == "Data"){
                delete that.selectedData[comid]
                delete that.dataComponent[comid]
            }else if(comtype == "Viewer" || comtype == "Chart"){
                that.blueComponentsTypeCount[comtype] = that.blueComponentsTypeCount[comtype] + 1
            }
            that.blueComponentsTypeCount[comtype] = that.blueComponentsTypeCount[comtype] - 1
            // if exist viewer, "delete" remove button
            if(that.blueComponentNameList.length > 0){
                that.blueComponentNameList.splice(that.blueComponentNameList.indexOf(comid), 1)
            }
        },
        getComponentById(id) { //by id
            for (let i = 0; i < this.blueComponents.length; i++) {
                if (id == this.blueComponents[i].getId()) {
                    return this.blueComponents[i];
                }
            }
            return null
        },
        getblueLinesByLinkName(name){
            //name sourceId_targetId Chart-0_Chart-1
            let list = []
            this.blueLines.forEach( (d,i) => {
                let connect = d.getConnectInfo()
                let linkName = connect.sourceId + '_' + connect.targetId
                if(linkName == name){
                    list.push(connect)
                }
            })
            return list
        },
        changeMouseActionType(type){
            let content = {
                "Connection": {
                    "text": 'Attribute Mapping',
                    "color": "#838DFF",
                    "index": 1
                },
                "Filter": {
                    "text": "Filter Condition",
                    "color": "#70B34D",
                    "index": 2
                },
                "Highlight": {
                    "text": "Highlight Condition",
                    "color": "#FFB429",
                    "index": 3
                },
                "Refresh": {
                    "text": "Refresh editor",
                    "color": "#B81D17",
                    "index": -1
                }
            }
            this.mouseActionType = JSON.parse(JSON.stringify(content[type]))
            this.h5Style.background = content[type].color;
        },
        highlightHandler(){},
        refresh(){
            let that = this
            let cleanAttribution = function(){
                for(let key in that.controlComponentCount){
                    that.controlComponentCount[key] = 0
                }
                for(let key in that.comChartCount){
                    that.comChartCount[key] = 0
                }
                for(let key in that.blueComponentsTypeCount){
                    that.blueComponentsTypeCount[key] = 0
                }
                that.dataComponent = {}
                that.blueComponents = []
                that.selectedData = {}
                that.loadedDatasets = {}
                that.blueLines = []
                that.exstingPorts = []
                that.blueLinesDelSignal = false
                that.chartLayout = {}
                that.chartLayoutObj = {}
                that.blueComponentNameList = []
                that.componentGraph = []
                that.chartData = {}
                that.dataMapper = {}
                that.lastBlueLines = []
                that.blueLinesName = []
            }
            cleanAttribution()
            //add components
            d3.selectAll('.blueComponent').remove()
            d3.selectAll('.blueLine').remove()
            this._components.forEach(d => {
                that.addBlueComponent(d)
            })
            that.changeMouseActionType("Refresh")
            window.setTimeout(function(){
                that.changeMouseActionType('Connection')
            },500);
        },
        dataComponentHandler(name, dim){
            //先判断是否存在 再画
            //添加新的rect类型，数据只有出
            let that = this,
                comid = 'data-'+ name,
                modelconfig = {
                    'outPorts': [{'attr': 'encoding', 'name': dim.key, 'text': dim.key, 'type': 'out'}],
                    'interaction': 'data',
                    'type': 'data',
                    'flag': false,
                    'obj': null,
                    'name': name,
                    'control': 'data',
                    'id': 'data-'+ name,
                    'fill': that.componentTypes['data'].color
                }
                
            let addClickEvent2Circle = function(that, com){
                com.getAllCircles().on("click", function(d) {
                    let opt = {
                    "com": d, //port
                    "container": that.container,
                    "coverColor": that.mouseActionType.color,
                    "mouseActionType": that.mouseActionType,
                    "id": "blueLines-" + that.blueLines.length
                   }
                that.addLine(opt)
                });
            }
            let addDataComponent = function(that, obj){
                    let gap = window.innerHeight * 0.765 / (that.blueComponentsTypeCount[obj.interaction] + 3)
                    obj['x'] = 100;
                    obj['y'] = Math.floor(gap * (that.blueComponentsTypeCount[obj.interaction] + 1))

                    //outports
                    for(let i=0; i<obj.outPorts.length; i++){
                        obj.outPorts[i]["parentX"] = obj['x'];
                        obj.outPorts[i]["parentY"] = obj['y'];
                        obj.outPorts[i]["parent"] = obj['name'];
                        obj.outPorts[i]["parentid"] = obj['id'];
                    }
                    return obj
            }

            let obj = JSON.parse(JSON.stringify(addDataComponent(that, modelconfig)))

            if(this.getComponentById(comid) != null){
                let com = this.getComponentById(comid)
                let flag = false
                    that.selectedData[comid].forEach((v,j) => {
                        if(dim.key == v.name){
                            flag = true
                        }
                    })
                    if(!flag){
                        com.addPort("out", JSON.parse(JSON.stringify(obj.outPorts[0])))
                        that.selectedData[comid].push(JSON.parse(JSON.stringify(obj.outPorts[0])))
                    }

                addClickEvent2Circle(that, com)
            } else {
                that.blueComponentsTypeCount[obj.type] = that.blueComponentsTypeCount[obj.type] + 1
                let _com = new BlueComponent(that.container, obj);
                that.blueComponents.push(_com);
                that.updateDataMapper({
                    "status": 0,
                    "options":{
                        "obj": obj
                    }
                })
                that.selectedData[comid] = []
                that.selectedData[comid].push(JSON.parse(JSON.stringify(obj.outPorts[0])))
                addClickEvent2Circle(that, _com)
            }

        }
        
    },
    mounted() {

        let that = this;
        this.chartInit("#preview");
        setInterval(function() {
            that.blueLines.forEach(function(line) {
                line.animate();
            });
        }, 20);
        setInterval(function(){
            if(that.blueLines.length){
            let templength = that.blueLines.length;
            for(let i=0; i<templength; i++){
                if(that.blueLines[i].getConnectInfo().isDeleted == "true"){
                    that.blueLines.splice(i,1)
                    templength = templength - 1
                    }
                }
            }
        }, 1500)
    }
}
</script>
<style>
.el-header {
    text-align: center;
}
.buttonInner {
    display: inline-block;
}
.el-main{
    
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}
.row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
.el-button--text{
    color: grey !important
}
.el-divider__text{
    font-weight: 700;
    font-size: 16px;
}
.vs-popup{
    width: 1470px !important;
    height: 910px !important; 
}
.con-radios{
    display: flex;
    flex-direction: column;
    align-items:flex-start;
    padding: 5px;
}
</style>

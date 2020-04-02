import * as d3 from "d3";
const Tool = {
  getDataMapper(tablename, dragclass, oper, gro) {
    var Mapperdata = {
      tablename: tablename,
      fieldname: dragclass, //字段名
      pre: oper,
      groub: gro
    };
    return Mapperdata;
  },
  SetInputval(input, Mapperdata) {
    input.val(
      Mapperdata.tablename +
        ":" +
        Mapperdata.fieldname +
        "," +
        Mapperdata.pre +
        "," +
        Mapperdata.groub
    );
  },
  SetMapfromAndAlias(set, Mapperdata) {
    set.Mapfrom =
      Mapperdata.tablename +
      ":" +
      Mapperdata.fieldname +
      "," +
      Mapperdata.pre +
      "," +
      Mapperdata.groub;
    set.Alias = Mapperdata.fieldname;
  },
  //判断是否为日期
  isDate(str) {
    if (!/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.test(str)) return false;
    var year = RegExp.$1 - 0;
    var month = RegExp.$2 - 1;
    var date = RegExp.$3 - 0;
    var obj = new Date(year, month, date);
    return !!(
      obj.getFullYear() == year &&
      obj.getMonth() == month &&
      obj.getDate() == date
    );
  },
  CreatNewMapperDatas() {
    var MapperDatas = d3.map();
    return MapperDatas;
  }
};
export default Tool;

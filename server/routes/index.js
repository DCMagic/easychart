var express = require('express');
var router = express.Router();
var fs = require("fs")
var d3 = require("d3")
const dsv = d3.dsvFormat(",")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/saveOption', function(req, res, next){
  let image_name = req.body.image.name,
    image_data = req.body.image.data,
    chartIdArray_name = req.body.chartIdArray.name,
    chartIdArray_data = req.body.chartIdArray.data,
    buf = Buffer(image_data, 'base64')

  fs.writeFile('./public/images/' + image_name, buf, 'base64', function(err){
    if (err) {
      console.log('Images error occured - file either not saved or corrupted file saved.', err);
    } else {
      console.log('Images saved!');
    }
  });

  fs.writeFile('./public/chartIdArray/' + chartIdArray_name, JSON.stringify(chartIdArray_data), 'utf8', function (err) {
    if (err) {
      console.log('ChartIdArray error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('ChartIdArray saved!');
    }
  });

  res.setHeader('Content-Type', 'application/json');
  res.json({"status":"success"})
})

router.post("/getdata", function(req, res, next){
  /*
  {
    dataName:"cars"
  }
  */
  let dataName = req.body.dataName
  if(dataName && dataName != undefined){
    var Folder = "./public/data/"
    fs.readdir(Folder, (err, files) => {
      files.forEach(file => {
        let fileName = file.split('.')[0],
          fileType = file.split('.')[1]
        if(dataName == fileName){
          if(fileType == "json"){
            fs.readFile(Folder + file, 'utf8', function readFileCallback(err, data){
              if (err){
                  console.log(err);
              } else {
                obj = JSON.parse(data); //now it an object
                res.json({"url": "getData", "data": obj})
            }});
          } else if(fileType == "csv"){
            fs.readFile(Folder + file, 'utf8', function readFileCallback(err, data){
              if (err){
                  console.log(err);
              } else {
                let obj = dsv.parse(data)
                res.json({"url": "getData", "data": obj})
            }});
          }
        }
      });
    })
  }else{
    res.json({"status":"fail"})
  }
})

module.exports = router;

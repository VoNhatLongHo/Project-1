const express = require('express');
// Require user route
const userRoute = require('./routes/gis');

const app = express(); 
const port = 8081; 

app.use(express.static('public/'));
app.use(express.static('views/'));

//app.get('/', function(req, res){
//    res.sendFile('views/gis/index04_Ajax_receive_earthquakes_GeoJSON_fromServer.html', {root:'.'});
//})

app.get('/geojson', function(req, res){
	res.sendFile('public/data/thunhapbinhquan.geojson',{root:'.'});
})

//app.set('views', './views');

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.use('', userRoute);

app.listen(port, function(){
    console.log("Your app running on port: " + port);
    console.log(`Ứng dụng đang chạy ở cổng: ${port}`);
})

//Để chạy thì máy phải cài NodeJS
//Vào thư mục chứa project trong cmd chạy: npm install để cài các gói cần thiết
//Khởi động server trong cmd bằng lệnh: node server.js
//Vào trình duyệt truy cập: http://localhost:8081/

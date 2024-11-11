var mongoClient = require('mongodb').MongoClient;
var  config = require('./mongodb');

const connectmongodb=()=>{
    mongoClient.connect(config, function (err, db) {
        //neu ket noi khong thanh cong thi in ra loi
        if (err) throw err;
        //neu thanh cong thi log ra thong bao
        console.log('Tao thanh cong database');
    });
}

module.exports={connectmongodb}
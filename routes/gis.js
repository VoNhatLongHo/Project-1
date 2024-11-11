const express = require('express');
const user_router = express.Router();
const user_controller = require('../controllers/gis');

user_router.get('', user_controller.gis);
user_router.get('/earthquakes', user_controller.earthquakes);   //from server online
user_router.get('/income', user_controller.income);             //from geojson file
user_router.get('/iframe', user_controller.iframe);             //from file contain iframe
user_router.get('/dbtogeojson', user_controller.dbtogeojson);   //from db to geojson
user_router.get('/dbname', user_controller.dbname);   //from db to geojson
user_router.get('/gisfromdb', user_controller.gisfromdb);       //from geojson, which is from db above
user_router.post('/addtodb', user_controller.addtodb);       //

user_router.get('/mongo', user_controller.mongo);       //
module.exports = user_router;

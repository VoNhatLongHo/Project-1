// Import các thư viện cần thiết
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 8081;

// Cấu hình CORS để cho phép mọi nguồn truy cập
app.use(cors());

// Khởi tạo MongoDB (nếu cần thiết)
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let database;

client.connect().then(() => {
  database = client.db('yourDatabaseName'); // Đổi tên cơ sở dữ liệu phù hợp
  console.log('Connected to MongoDB');
}).catch(error => console.error('MongoDB connection error:', error));

// Thiết lập middleware để phục vụ các tệp tĩnh và phân tích dữ liệu JSON
app.use(express.static('public/'));
app.use(express.static('views/'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route để kiểm tra kết nối đến Carto
app.get('/api/checkCartoConnection', async (req, res) => {
  const cartoUserName = "thunbergii";
  const apiKey = "your_api_key_here";
  const url = `https://${cartoUserName}.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20information_schema.tables&api_key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Lỗi khi kết nối đến Carto:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route để lấy dữ liệu từ Carto và gửi lại cho client
app.get('/api/getCartoData', async (req, res) => {
  const cartoUserName = "thunbergii";
  const apiKey = "your_api_key_here";
  const sqlQuery = "SELECT name, the_geom FROM dulieumau";
  const url = `https://${cartoUserName}.carto.com/api/v2/sql?format=GeoJSON&q=${encodeURIComponent(sqlQuery)}&api_key=${apiKey}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ Carto:", error);
    res.status(500).send("Không thể lấy dữ liệu từ Carto");
  }
});

// Route để lưu đối tượng vẽ vào Carto
app.post('/api/saveDrawing', async (req, res) => {
  const { geometry, name } = req.body;
  const cartoUserName = "thunbergii";
  const apiKey = "your_api_key_here";
  const sql = `INSERT INTO dulieumau (the_geom, name) VALUES (ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326), '${name}')`;
  
  try {
    const url = `https://${cartoUserName}.carto.com/api/v2/sql?q=${encodeURIComponent(sql)}&api_key=${apiKey}`;
    const response = await axios.post(url);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu vào Carto:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route để phục vụ file HTML chính
app.get('/index08', (req, res) => {
  res.sendFile('index08_readdatafromCarto_drawObject_Save.html', { root: './views/gis' });
});

// Khởi động server
app.listen(port, function() {
  console.log("Server đang chạy trên cổng: " + port);
});

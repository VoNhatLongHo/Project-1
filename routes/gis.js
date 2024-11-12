// Import các thư viện cần thiết
const express = require('express');
const user_router = express.Router();
const user_controller = require('../controllers/gis'); // Import controller chứa logic xử lý cho các route

// Route chính (root): Gọi hàm `gis` từ controller để trả về dữ liệu hoặc trang chính nếu có
user_router.get('', user_controller.gis); 

// Route `/earthquakes`: Lấy dữ liệu động đất từ server online
user_router.get('/earthquakes', user_controller.earthquakes);

// Route `/income`: Lấy dữ liệu từ file GeoJSON chứa thu nhập trung bình (ví dụ)
user_router.get('/income', user_controller.income);

// Route `/iframe`: Lấy nội dung HTML từ file chứa iframe
user_router.get('/iframe', user_controller.iframe);

// Route `/dbtogeojson`: Lấy dữ liệu từ cơ sở dữ liệu và chuyển đổi sang định dạng GeoJSON
user_router.get('/dbtogeojson', user_controller.dbtogeojson);

// Route `/dbname`: Lấy tên của cơ sở dữ liệu hoặc thông tin từ cơ sở dữ liệu
user_router.get('/dbname', user_controller.dbname);

// Route `/gisfromdb`: Lấy dữ liệu từ cơ sở dữ liệu và chuyển đổi thành GeoJSON, rồi trả về cho client
user_router.get('/gisfromdb', user_controller.gisfromdb);

// Route `/addtodb`: Nhận dữ liệu từ client và thêm vào cơ sở dữ liệu (phương thức POST)
user_router.post('/addtodb', user_controller.addtodb);

// Route `/mongo`: Một route riêng biệt để làm việc với MongoDB (có thể để test hoặc thao tác khác)
user_router.get('/mongo', user_controller.mongo);

// Xuất router để sử dụng trong file server.js
module.exports = user_router;

user_router.put('/updatelocation', user_controller.updateLocation); // Cập nhật điểm GIS
user_router.delete('/deletelocation', user_controller.deleteLocation); // Xóa điểm GIS


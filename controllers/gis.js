// Import các thư viện cần thiết
const mssqloperations = require('../dbconfig/msqloperations');
const mongodboperations = require('../dbconfig/mongodboperations');
const wkx = require('wkx');

module.exports = {
    // Route để hiển thị trang chính của GIS
    gis: (req, res) => {
        res.sendFile('index01_basemap_raster.html', { root: './views/gis' });
    },

    // Route để hiển thị trang về dữ liệu động đất
    earthquakes: (req, res) => {
        res.sendFile('index04_Ajax_receive_earthquakes_GeoJSON_fromServer.html', { root: './views/gis' });
    },

    // Route để hiển thị dữ liệu thu nhập từ file GeoJSON
    income: (req, res) => {
        res.sendFile('index04_Ajax_receive_income_GeoJSON_fromfile.html', { root: './views/gis' });
    },

    // Route để hiển thị trang với iframe
    iframe: (req, res) => {
        res.sendFile('f1.html', { root: './views/html' });
    },

	dbtogeojson: (req, res) => {
		mssqloperations.getDulieumau(req.query.q)
			.then((recordset) => {
				console.log("Recordset from SQL Server:", recordset); // Log dữ liệu từ SQL Server
				try {
					if (!recordset || recordset.length === 0) {
						console.log("No data returned from SQL Server");
						return res.status(200).send({ type: "FeatureCollection", features: [] });
					}
	
					const featureCollection = {
						"type": "FeatureCollection",
						"features": recordset.map(item => {
							console.log("Processing WKT:", item.Wkt); // Log từng WKT để kiểm tra
							return {
								"type": "Feature",
								"geometry": wkx.Geometry.parse(item.Wkt).toGeoJSON(),
								"properties": {
									name: item.Name,
									// Thêm các thuộc tính khác từ item nếu có
								}
							};
						})
					};
					
					res.json(featureCollection);
				} catch (error) {
					console.error("Error converting data to GeoJSON:", error);
					res.status(500).send({ error: "Failed to convert data to GeoJSON" });
				}
			})
			.catch((error) => {
				console.error("Error in /dbtogeojson request:", error);
				res.status(500).send({ error: "Internal Server Error" });
			});
	},
	


    // Route để lấy dữ liệu từ database và trả về dưới dạng JSON
    dbname: (req, res) => {
        mssqloperations.getDulieumau(req.query.q).then((recordset) => {
            res.send(recordset);
        }).catch(err => {
            console.error("Error fetching data:", err);
            res.status(500).send({ error: "Failed to fetch data" });
        });
    },

    // Route để hiển thị trang nhận dữ liệu từ database
    gisfromdb: (req, res) => {
        res.sendFile('index04_Ajax_receive_fromdb.html', { root: './views/gis' });
    },

    // Route để thêm dữ liệu vào database
    addtodb: (req, res) => {
        const query = "INSERT INTO DULIEUMAU (The_geom, Name) VALUES (geometry::STGeomFromText('" + req.body.wkt + "', 0), N'" + req.body.name + "')";
        mssqloperations.addDulieumau(query).then(() => {
            res.send({ success: "Inserted Successfully", status: 200 });
        }).catch(err => {
            console.error("Error adding data:", err);
            res.status(500).send({ error: "Failed to add data" });
        });
    },

    // Route để kết nối MongoDB (nếu cần thiết cho các thao tác MongoDB)
    mongo: (req, res) => {
        mongodboperations.connectmongodb().then(() => {
            res.send("Connected to MongoDB");
        }).catch(err => {
            console.error("Error connecting to MongoDB:", err);
            res.status(500).send({ error: "Failed to connect to MongoDB" });
        });
    },

    // Route để cập nhật dữ liệu trong database (sửa điểm GIS)
    updateLocation: (req, res) => {
        const query = "UPDATE DULIEUMAU SET The_geom = geometry::STGeomFromText('" + req.body.wkt + "', 0), Name = N'" + req.body.name + "' WHERE Id = " + req.body.id;
        mssqloperations.updateDulieumau(query).then(() => {
            res.send({ success: "Updated Successfully", status: 200 });
        }).catch(err => {
            console.error("Error updating data:", err);
            res.status(500).send({ error: "Failed to update data" });
        });
    },

    // Route để xóa dữ liệu trong database (xóa điểm GIS)
    deleteLocation: (req, res) => {
        const query = "DELETE FROM DULIEUMAU WHERE Id = " + req.body.id;
        mssqloperations.deleteDulieumau(query).then(() => {
            res.send({ success: "Deleted Successfully", status: 200 });
        }).catch(err => {
            console.error("Error deleting data:", err);
            res.status(500).send({ error: "Failed to delete data" });
        });
    }
};

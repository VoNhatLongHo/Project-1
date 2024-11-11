const  mssqloperations= require('../dbconfig/msqloperations');
const mongodboperations=require('../dbconfig/mongodboperations');
const wkx=require('wkx');
module.exports={
    gis: (req,res)=>{
        res.sendFile('index01_basemap_raster.html',{root:'./views/gis'});
    },
    earthquakes: (req, res)=>{
        res.sendFile('index04_Ajax_receive_earthquakes_GeoJSON_fromServer.html',{root:'./views/gis'});
    },
    income: (req, res)=>{
        res.sendFile('index04_Ajax_receive_income_GeoJSON_fromfile.html',{root:'./views/gis'});
    },
    iframe: (req, res)=>{
        res.sendFile('f1.html',{root:'./views/html'});
    },
    dbtogeojson: (req, res)=>{
		/*Để kết nối sql server thành công, cần thực hiện:
		  - Vào SQL Server bằng window authentication
		  - Đặt lại pass cho tài khoản sa và enable nó, trong security / login, Rclick/properties trên sa
		     + Tab General: đặt lại pass
		     + Tab Status: chọn enable
		  - Cho phép đăng nhập bằng tài khoản
		     + Rclick trên tên Server của SQL / Properties
		     + Chọn Tab Security, chọn SQL server and window authentication mode
		  - Vào Manage của this PC
		     + Chọn Service and application / SQL server configuration Manager / SQL server Network configuration / Protocol for ...
		     + Bật TCP/IP là enabled và kiểm tra IP addresses, mục IPAll đặt TCP Port là 1433
		  - Restart lại service của SQL server
		*/
		
		//JSON.stringify(req.query)=='{}')
		//SELECT Id, The_geom.STAsText() Wkt, Name  FROM DULIEUMAU
		mssqloperations.getDulieumau(req.query.q).then((recordset)=>{
				try{
					//Dựng thành chuỗi GeoJson
				var featurecollection = {
					"type": "FeatureCollection",
					"features":[]
				}
				for (const Item of recordset) {
					var feature={
						"type":'Feature',
						"geometry": wkx.Geometry.parse(Item.Wkt).toGeoJSON(), //wkt to Geometry
						"properties": {
						}
					};

					Object.entries(Item).forEach(([key, value])=> {
						if (key !== "Wkt") {
							feature.properties[key.toLowerCase()]=value; //Thêm kye value mới vào đối tượng Json
						}
					});

					featurecollection.features.push(feature);
				}
					// send records as a response
				res.send(featurecollection);
			}
			catch (err){
				console.log(err);
			}
		});
    },

    dbname: (req, res)=>{
		mssqloperations.getDulieumau(req.query.q).then((recordset)=>{
			res.send(recordset);
		})
	},
	

    gisfromdb:(req,res)=>{
        res.sendFile('index04_Ajax_receive_fromdb.html',{root:'./views/gis'});
    },

	addtodb:(req,res)=>{
		q="INSERT INTO DULIEUMAU (The_geom, Name) VALUES (geometry::STGeomFromText('"+req.body.wkt+"', 0), N'"+ req.body.name+"')";
		mssqloperations.addDulieumau(q).then(()=>res.send('{"success" : "Updated Successfully", "status" : 200}'));
	},
		
	mongo:(req, res)=>{
		mongodboperations.connectmongodb();
	}
}
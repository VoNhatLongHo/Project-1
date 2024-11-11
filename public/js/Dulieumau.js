//Chờ trang web nạp xong mới thực hiện các lệnh sau
$(document).ready(function () {
    var mapObject = L.map("map", { center: [10.030249, 105.772097], zoom: 17 });
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: '&copy; <a href="http://' +
                'www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    ).addTo(mapObject);

    //Khai báo lớp bản đồ và định dạng cho các point, linestring, polygon
    var layerObject = L.layerGroup().addTo(mapObject);

    var pointStyle = L.icon({
        iconUrl: "../css/images/redicon.png",
        shadowUrl: "../css/images/marker-shadow.png",
        iconAnchor: [13, 41]  //Giữa đáy ảnh 25, 41 (RClick trên ảnh / Properties)
    });
    var lineStyle = { color: "red", weight: 2 };
    var polygonStyle = { color: "red", fillColor: "yellow", weight: 2 };

    sqlloadalldata='SELECT Id, The_geom.STAsText() Wkt, Name  FROM DULIEUMAU';
    //Hiển thị tất cả đối tượng lên bản đồ
    $.getJSON('/dbtogeojson?q='+sqlloadalldata, function (data) {
        loadtomap(data);
    });

	//Thêm điều khiển mới là combo box rỗng lên bản đồ
	var control1 = L.control({position: "topleft"});
	control1.onAdd = function(map) {
		var div = L.DomUtil.create("div", "div1");
		div.innerHTML = '<select id="combobox1"></select>';
		return div;
	};
	control1.addTo(mapObject);

	//Lấy giá trị của cột Name không trùng thêm vào combo box
	var sqldbname = "SELECT DISTINCT name FROM dulieumau ORDER BY name";
	$.getJSON("/dbname?q=" + sqldbname, function(data) {
		var menu = $("#combobox1");
        menu.append("<option>Tất cả</option>");
		$.each(data, function(key, value) {
			menu.append("<option>" + value.name + "</option>");
		});
	});

	//Cập nhật đối tượng trên bản đồ khi combo box được chọn
	$("#combobox1").on("change", function() {
        sqlcombobox='SELECT Id, The_geom.STAsText() Wkt, Name  FROM DULIEUMAU';
		var valueSelected = $("#combobox1").val();
		if (valueSelected !== "Tất cả")
            sqlcombobox+=" WHERE name = N'" + valueSelected + "'";
		$.getJSON('/dbtogeojson?q=' + sqlcombobox, function(data) {
            layerObject.clearLayers();
            loadtomap(data);
		});
	});

    //Thêm điều khiển vẽ; Icon mặc nhiên trong thư mục css/images
    //https://cdnjs.com/libraries/leaflet.draw
    var drawnItems = L.featureGroup().addTo(mapObject);
    new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        }
    }).addTo(mapObject);

    //layer để giữ đối tượng đang vẽ hoặc đang được chọn
    var layer = new L.Layer();

    //Tạo nút lệnh Save
    var control2 = L.control({ position: "topright" });
    control2.onAdd = function (map) {
        var div = L.DomUtil.create("div", "divsave");
        div.innerHTML = '<input type="button" id="save" value="Save">';
        return div;
    };
    control2.addTo(mapObject);

    //Khi vẽ thì thêm vào lớp drawnItems
    mapObject.on("draw:created", function (e) {
        layer = e.layer;
        layer.addTo(drawnItems);
        var popupContent =
            '<form>' +
            'Name:<br><input type="text" id="input_name" value=""><br>' +
            '<input type="button" value="Submit" id="submit">' +
            '</form>';
        layer.bindPopup(popupContent).openPopup();

    });

    drawnItems.on('popupopen', function (e) {
        layer = e.layer;
    });

    $("body").on("click", "#submit", addprops);

    $("#save").on("click", function () {
        var save=false;
        drawnItems.eachLayer(function (layer) {
            var geometry = layer.toGeoJSON().geometry,
                geojson = layer.toGeoJSON();

            var wkx = require('wkx');
            //var wellknown=require('wellknown');
            //alert(wellknown.stringify(geojson));
            var wkt = wkx.Geometry.parseGeoJSON(geometry).toWkt(); //WKT
            var data = {
                'name': geojson.properties.name,
                'wkt': wkt
            };

            $.ajax({
                async: false,
                type: 'POST',
                url: '/addtodb',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: "json",
                success: function (data) {
                    //alert(data.success);
                    save=true;
                },
                error: function (error) {
                    alert('Không thể lưu được Lớp này');
                }
            });

            //Thêm đối tượng mới lưu vào lớp cũ
            L.geoJSON(layer.toGeoJSON(), {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(layer.feature.properties.name);
                }
            }).addTo(layerObject);
        });
        if (save)
            alert('Đã lưu thành công');
        drawnItems.clearLayers();
    });

    //Khi click để tìm đối thỏa khoảng cách
	var myLocation = L.layerGroup().addTo(mapObject);		//chứa điểm khi click
    var findLocations = L.layerGroup().addTo(mapObject);	//chứa các đối tượng tìm khi thỏa khoảng cách
    
    document.addEventListener('click', evt => {
        var elm = evt.target
        var clickSelectInput=false;
        var els = []
        while (elm.tagName) {
            els.push(elm.tagName)
            if (elm.tagName=='SELECT' || elm.tagName=='INPUT')
                clickSelectInput=true
            elm = elm.parentNode
            }
        //alert(els)
        if(!clickSelectInput){
            mapObject.on("click", mapClick)}
    }, true);

	
	//Thêm điều khiển mới là Textbox rỗng lên bản đồ
	var control3 = L.control({position: "topleft"});
	control3.onAdd = function(map) {
		var div = L.DomUtil.create("div", "div1");
		div.innerHTML = '<input id="textbox1" type="number" value=100></input>';
		return div;
	};
	control3.addTo(mapObject);

	var pointStyle1 = L.icon({								//Cho điểm khi clich
		iconUrl: "css/images/blueicon.png",
		shadowUrl: "css/images/marker-shadow.png",
		iconAnchor: [13, 41]  //Giữa đáy ảnh 25, 41 (RClick trên ảnh / Properties)
	});
	var pointStyle2 = L.icon({								//cho điểm khi tìm thỏa khoảng cách
		iconUrl: "css/images/redicon.png",
		shadowUrl: "css/images/marker-shadow.png",
		iconAnchor: [13, 41]
	});
	var lineStyle1={color: "blue", weight: 2};				//cho đường tìm thỏa khoảng cách
	var lineStyle2={color: "red", weight: 1};				//Cho đường nối

	function mapClick(e) {
		myLocation.clearLayers();
		L.marker(e.latlng, {icon:pointStyle2}).addTo(myLocation);
		var clickCoords = e.latlng;
		findLocations.clearLayers();

        var value = $("#textbox1").val();
		var sqldistance ="SELECT name, the_geom.STAsText() Wkt, "+
								"ROUND(geography::STGeomFromText(the_geom.STAsText(),4326).STDistance(geography::STGeomFromText('POINT(" +
								clickCoords.lng + " " + clickCoords.lat + ")', 4326)), 2) as dis_met " +
							"FROM dulieumau "+
							"WHERE ROUND(geography::STGeomFromText(the_geom.STAsText(),4326).STDistance(geography::STGeomFromText('POINT(" +
                            clickCoords.lng + " " + clickCoords.lat + ")', 4326)), 2)<"+value;
                            
        $.getJSON('/dbtogeojson?q=' + sqldistance).done(function(data) {
            layerObject.clearLayers();
			L.geoJSON(data, {
				onEachFeature: function(feature, layer) {
					layer.bindPopup("<i>" + feature.properties.name + "</i>" +
                                    "<br> Cách điểm chọn là: "+feature.properties.dis_met+" met");
					var objectCoords=feature.geometry.coordinates;
					//console.log(objectCoords);
					if (feature.geometry.type=="Point") {
						L.polyline([[clickCoords.lat, clickCoords.lng], [objectCoords[1], objectCoords[0]]], lineStyle2).addTo(findLocations);
					}	
					if (feature.geometry.type=="LineString") {
						L.polyline([[clickCoords.lat, clickCoords.lng], [objectCoords[0][1], objectCoords[0][0]]], lineStyle2).addTo(findLocations);
					}	
					if (feature.geometry.type=="Polygon") {
						L.polyline([[clickCoords.lat, clickCoords.lng], [objectCoords[0][0][1], objectCoords[0][0][0]]], lineStyle2).addTo(findLocations);
					}
				},
				//Có thể thêm để chủ động icon cho point
				//pointToLayer: function (feature, latlng){
				//						return L.marker(latlng, {icon:pointStyle1});			
				//},
				//icon mặc định trong css/images
				style: function(){
					return lineStyle1;
				}					
			}).addTo(findLocations);
		});							
	}



    function addprops() {
        layer.feature = {};
        layer.feature.type = "Feature";
        layer.feature.properties = {};
        layer.feature.properties.name = $("#input_name").val();
        layer.closePopup();
        var popup = layer.getPopup(),
            content = popup.getContent(),
            start = content.indexOf('id="input_name"', 0),
            end = content.indexOf('>', start),
            l = content.substr(0, start);
        r = content.substr(end, content.length);
        console.log(content);
        content = l + 'id="input_name" value="' + $("#input_name").val() + '"' + r;

        layer.bindPopup(content).closePopup();
    }

    function loadtomap(data){
        L.geoJSON(data, {
            style: function (feature) {
                switch (feature.geometry.type) {
                    case 'LineString': return lineStyle;
                    case 'Polygon': return polygonStyle;
                }
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup("<i>" + feature.properties.name + "</i>");
                }
            },
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, { icon: pointStyle });
            }
        }).addTo(layerObject);
    }
});


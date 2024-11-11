var wkx = require('wkx');
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

    //Khai báo user và loại kq trả về trên Carto
    var cartoUserName = "duckhoact";
    var urlGeoJSON = "https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=";

    //Khai báo chuỗi truy vấn và lớp bản đồ
    var sqlQuery = "SELECT name, the_geom FROM dulieumau";
    var layerObject = L.layerGroup().addTo(mapObject);

    var pointStyle = L.icon({
        iconUrl: "../css/images/redicon.png",
        shadowUrl: "../css/images/marker-shadow.png",
        iconAnchor: [13, 41]  //Giữa đáy ảnh 25, 41 (RClick trên ảnh / Properties)
    });
    var lineStyle = { color: "red", weight: 2 };
    var polygonStyle = { color: "red", fillColor: "yellow", weight: 4 };

    //Hiển thị tất cả đối tượng lên bản đồ
    $.getJSON('/DanhMuc/AllDulieumau', function (data) {
        console.log(data);
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
    var control = L.control({ position: "topright" });
    control.onAdd = function (map) {
        var div = L.DomUtil.create("div", "divsave");
        div.innerHTML = '<input type="button" id="save" value="Save">';
        return div;
    };
    control.addTo(mapObject);

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

    var url = "https://" + cartoUserName + ".carto.com/api/v2/sql";
    $("#save").on("click", function () {
        drawnItems.eachLayer(function (layer) {
            var geometry = layer.toGeoJSON().geometry,
                geojson = layer.toGeoJSON();
            var wkt = wkx.Geometry.parseGeoJSON(geometry).toWkt(); //WKT
            var data = {
                'name': geojson.properties.name,
                'wkt': wkt
            };

            $.ajax({
                async: false,
                type: 'POST',
                url: '/DanhMuc/AddDulieumau',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: "json",
                success: function (data) {
                    alert('Đã lưu thành công');
                },
                error: function (error) {
                    alert('Không thể lưu được Lớp này');
                }
            });

            L.geoJSON(layer.toGeoJSON(), {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(layer.feature.properties.name);
                }
            }).addTo(layerObject);

        });
        drawnItems.clearLayers();
    });

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
});


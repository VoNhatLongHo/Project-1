// Hàm để tải tất cả các địa điểm và hiển thị trên bản đồ
function loadLocations() {
  fetch('/dbtogeojson')
      .then(response => {
          if (!response.ok) throw new Error("Failed to load locations");
          return response.json();
      })
      .then(data => {
          if (data && data.features) {
              data.features.forEach(feature => {
                  const coords = feature.geometry.coordinates;
                  const marker = L.marker([coords[1], coords[0]]).addTo(map);
                  marker.bindPopup(`<b>${feature.properties.name}</b>`);
              });
          } else {
              console.error("No features found in data");
          }
      })
      .catch(error => console.error('Error loading locations:', error));
}

// Hàm để thêm địa điểm
function addLocation() {
  const name = document.getElementById('name').value;
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;

  if (!name || !latitude || !longitude) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
  }

  fetch('/addtodb', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          wkt: `POINT(${longitude} ${latitude})`,
          name: name
      })
  })
  .then(response => {
      if (!response.ok) throw new Error("Failed to add location");
      return response.json();
  })
  .then(data => {
      if (data.status === 200) {
          alert('Địa điểm đã được thêm thành công!');
          loadLocations(); // Tải lại các địa điểm sau khi thêm mới
      } else {
          alert('Có lỗi xảy ra khi thêm địa điểm!');
      }
  })
  .catch(error => console.error('Error:', error));
}

// Hàm để sửa địa điểm
function updateLocation() {
  const name = document.getElementById('name').value;
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;
  const id = prompt('Nhập ID của địa điểm bạn muốn sửa:');

  if (!id || !name || !latitude || !longitude) {
      alert("Vui lòng điền đầy đủ thông tin và nhập ID hợp lệ!");
      return;
  }

  fetch('/updatelocation', {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          id: id,
          wkt: `POINT(${longitude} ${latitude})`,
          name: name
      })
  })
  .then(response => {
      if (!response.ok) throw new Error("Failed to update location");
      return response.json();
  })
  .then(data => {
      if (data.status === 200) {
          alert('Địa điểm đã được sửa thành công!');
          loadLocations(); // Tải lại các địa điểm sau khi cập nhật
      } else {
          alert('Có lỗi xảy ra khi sửa địa điểm!');
      }
  })
  .catch(error => console.error('Error:', error));
}

// Hàm để xóa địa điểm
function deleteLocation() {
  const id = prompt('Nhập ID của địa điểm bạn muốn xóa:');

  if (!id) {
      alert("Vui lòng nhập ID hợp lệ!");
      return;
  }

  fetch('/deletelocation', {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: id })
  })
  .then(response => {
      if (!response.ok) throw new Error("Failed to delete location");
      return response.json();
  })
  .then(data => {
      if (data.status === 200) {
          alert('Địa điểm đã được xóa thành công!');
          loadLocations(); // Tải lại các địa điểm sau khi xóa
      } else {
          alert('Có lỗi xảy ra khi xóa địa điểm!');
      }
  })
  .catch(error => console.error('Error:', error));
}

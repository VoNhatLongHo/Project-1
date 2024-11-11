var Lop = [];
//Lấy table Lop cho vào mãng Lop
function LoadLop() {
    $.ajax({
        async: false,  //các dòng code khác chờ cho ajax thực hiện xong
        type: "GET",
        url: '/DanhMuc/AllLop',
        contentType: "application/json",
        success: function (data) {
            Lop = data;
            console.log(data);
        }
    });
}

//Tạo dữ liệu cho bảng lọc Filter
function LoadFilter() {
    $('#msloptim').append($('<option/>').val('%').text('All'));
    $('#tenloptim').append($('<option/>').val('%').text('All'));
    var j = -1;
    $.each(Lop, function (i, vallop) {
        $('#msloptim').append($('<option/>').
            val(vallop.Mslop).text(vallop.Mslop + " | " + vallop.Tenlop));
        $('#tenloptim').append($('<option/>').
            val(vallop.Tenlop).text(vallop.Tenlop));
    });
}

//Load nội dung vào details
function LoadDetail(mslop, tenlop, bieuthucsisotoida) {
    //Load Lớp đã có vào Table có id="details"
    $('#details').empty();
    $.ajax({
        async: false,
        type: "GET",
        data: {
            'Mslop': mslop, 'Tenlop': tenlop,
            'Bieuthucsisotoida': bieuthucsisotoida
        },
        url: '/DanhMuc/FilterLop',
        contentType: "application/json",
        success: function (data) {
            $.each(data, function (i, lop) {
                AddDetail();
                $('#details').find('.mslop:last').val(lop.Mslop);
                $('#details').find('.tenlop:last').val(lop.Tenlop);
                $('#details').find('.sisotoida:last').val(lop.Sisotoida);
                //alert($('#details').find('.mshh:last').attr('id'));
            });
        },
        error: function (error) {
            alert('Lỗi rồi!');
        }
    });
}

//Để thêm từng dòng vào details
function AddDetail() {
    var $newRow = $('#mainrow').clone().removeAttr('id');

    //Replace save button with remove button
    $('#save', $newRow).addClass('delete').val('Xóa').
        removeClass('btn-success').addClass('btn-danger');

    $('#mslop', $newRow).prop("readonly", true);

    //remove id attribute from new clone row
    $('#mslop,#tenlop,#sisotoida', $newRow).removeAttr('id');
    //append clone row
    $('#details').append($newRow);
}

//Kiểm tra việc chọn phép toán đối với sĩ số tối đa
function ScanCheckBox(ele) {
    switch ($(ele).val()) {
        case 'Truoc':
            $('#pheptoantim').val('< ' + $('#sisotoidatimtruoc').val());
            break;
        case 'Trong':
            $('#pheptoantim').val('Between ' + $('#sisotoidatimtruoc').
                val() + ' and ' + $('#sisotoidatimsau').val());
            break;
        case 'Ngoai':
            $('#pheptoantim').val('Not Between ' + $('#sisotoidatimtruoc').
                val() + ' and ' + $('#sisotoidatimsau').val());
            break;
        case 'Sau': $('#pheptoantim').val('> ' + $('#sisotoidatimsau').val());
    }
}

//Chờ trang web nạp xong mới thực hiện các lệnh sau
$(document).ready(function () {
    //Khởi tạo dữ liệu cho Combobox Lop
    LoadLop();

    $('#title').text('Danh mục Lớp');
    LoadFilter();

    $('#pheptoantim').val('Between ' + $('#sisotoidatimtruoc').
        val() + ' and ' + $('#sisotoidatimsau').val());
    LoadDetail($('#msloptim').val(), $('#tenloptim').val(),
        $('#pheptoantim').val());

    //Khi chọn các giá trị để lọc
    $('.table').on('change',
        '#msloptim, #tenloptim, #sisotoidatimtruoc, #sisotoidatimsau',
        function () {
        $.each($('input[type="checkbox"]'), function (i, val) {
            if (val.checked) {
                ScanCheckBox(this);
            }
        });
        LoadDetail($('#msloptim').val(), $('#tenloptim').
            val(), $('#pheptoantim').val());
    });

    //Khi bỏ lọc lấy tất cả
    $('.table').on('click', '.all', function () {
        $('#details').empty();
        $('#msloptim').val('%');
        $('#tenloptim').val('%');
        $('#sisotoidatimtruoc').val('0');
        $('#sisotoidatimsau').val('255');
        $('#pheptoanmacdinhtim').prop('checked', true);
        $('#pheptoanmacdinhtim').siblings().prop('checked', false);
        $.each($('input[type="checkbox"]'), function (i, val) {
            if (val.checked) {
                ScanCheckBox(this);
            }
        });
        LoadDetail($('#msloptim').val(), $('#tenloptim').
            val(), $('#pheptoantim').val());
    });

    //Khi thay đổi phép toán tìm đối với sĩ số tôi đa
    $('input[type="checkbox"]').on('change', function () {
        $(this).siblings('input[type="checkbox"]').prop('checked', false);
        ScanCheckBox(this);
        LoadDetail($('#msloptim').val(), $('#tenloptim').
            val(), $('#pheptoantim').val());
    });

    //Khi Click vào nút Lưu có id="save"
    $('#save').click(function () {
        var isAllValid = true;
        //validate order items
        if ($('#mslop').val().trim() === '') {
            alert('Phải nhập Mã số Lớp có chiều dài <=6!');
            isAllValid = false;
        }
        else {
            if ($('#tenlop').val().trim() === '') {
                alert('Phải nhập Tên lớp!');
                isAllValid = false;
            }
            else {
                if ($('#sisotoida').val().trim() === '') {
                    alert('Phải nhập sĩ số lớp!');
                    isAllValid = false;
                }
            }
        }

        //Kiểm tra có trùng khóa chính không?
        $('#details tbody tr').each(function (index, ele) {
            if ($('.mslop', this).val().trim() === $('#mslop').val().trim()) {
                alert('Mã số lớp: ' + $('#mshh').
                    val().trim() + ', đã tồn tại, xin đổi mã khác!');
                isAllValid = false;
            }
        });


        if (isAllValid) {

            var lop = {
                Mslop: $('#mslop').val().trim(),
                Tenlop: $('#tenlop').val().trim(),
                Sisotoida: Number($('#sisotoida').val().trim())
            };
            console.log(lop);
            console.log(JSON.stringify(lop));
            $.ajax({
                async: false,
                type: 'POST',
                url: '/DanhMuc/AddLop',
                data: JSON.stringify(lop),
                contentType: 'application/json; charset=utf-8',
                dataType: "json",
                success: function (data) {
                    //Thêm vào Table có id="details"
                    AddDetail();
                    //clear select data
                    $('#mslop,#tenlop,#sisotoida').val('');
                    $('#orderItemError').empty();
                },
                error: function (error) {
                    alert('Không thể lưu được Lớp này');
                }
            });
        }
    });

    //Khi Click nút Xóa tất cả các Lớp có id="deleteall"
    $('#deleteall').click(function () {
        var xoa = confirm("Bạn có thật sự muốn xóa tất cả các Lớp không?");
        if (xoa) {
            $('#details tbody tr').each(function (index, ele) {
                var mslop = $('.mslop', this).val();
                $.ajax({
                    async: false,
                    type: 'POST',
                    url: '/DanhMuc/DeleteLop',
                    data: JSON.stringify(mslop),
                    contentType: 'application/json; charset=utf-8',
                    dataType: "json",
                    success: function (data) {
                        $(this).remove();
                    },
                    error: function (error) {
                        alert('Lớp cần xóa không tồn tại');
                        //console.log(error);
                    }
                });
            });
        }
    });

    //Khi Click nút Cập nhật có id="update"
    $('#update').click(function () {
        //validate order items
        $('#orderItemError').text('');
        var errorItemCount = 0;
        $('#details tbody tr').each(function (index, ele) {
            if (
                $('.mslop', this).val().trim() === "" ||
                $('.tenlop', this).val().trim() === "") {
                errorItemCount++;
                $(this).addClass('error'); //Đổi màu khi dòng bị lỗi
            }
            else {
                $(this).removeClass('error'); //Bỏ đổi màu vì dòng không lỗi
                var loptam = {
                    Mslop: $('.mslop', this).val().trim(),
                    Tenlop: $('.tenlop', this).val().trim(),
                    Sisotoida: Number($('.sisotoida', this).val().trim())
                };
                var mslop_lop = {
                    Mslopcu: loptam.Mslop,
                    Lop: loptam
                };
                $.ajax({
                    async: false,
                    type: 'POST',
                    url: '/DanhMuc/UpdateLop',
                    data: JSON.stringify(mslop_lop),
                    contentType: 'application/json; charset=utf-8',
                    dataType: "json",
                    success: function (data) {
                    },
                    error: function (error) {
                        alert('Không cập nhật được!');
                    }
                });
            }
        });

        if (errorItemCount > 0) {
            alert('Có lỗi trong vùng cần cập nhật!');
        }

    });

    //Khi Click nút Xóa trong Table có id="details"
    $('#details').on('click', '.delete', function () {
        var xoa = confirm("Bạn có thật sự muốn xóa Lớp có mã: " +
            $(this).parents('tr').find('.mslop').val());
        if (xoa) {
            var mslop = $(this).parents('tr').find('.mslop').val();
            $.ajax({
                async: false,
                type: 'POST',
                url: '/DanhMuc/DeleteLop',
                data: JSON.stringify(mslop),
                contentType: 'application/json; charset=utf-8',
                dataType: "json",
                success: function (data) {
                },
                error: function (error) {
                    alert('Lớp cần xóa không tồn tại');
                    //console.log(error);
                }
            });
            $(this).parents('tr').remove();
        }
    });

});


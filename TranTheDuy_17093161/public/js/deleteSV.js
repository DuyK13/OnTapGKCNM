function xoa(id) {
    var xoa = confirm("Bạn có chắc chắn xoá?");
    console.log(URL);
    if (xoa) {
        $.post('/quanlysinhvien/delete/' + id, data => {
            if (data) {
                alert("Xoá thành công");
                window.location.href = URL;
            } else {
                alert("Xoá không thành công");
            }
        });
    } else {
        alert("Huỷ xoá");
    }
}

function get(id) {
    fetch("/quanlysinhvien/" + id).then(response => response.json())
        .then(data => {
            if (data.error_code === 1) {
                $('#idUpdate').val(data.result.id);
                $('#maSVUpdate').val(data.result.ma_sinhvien);
                $('#tenSVUpdate').val(data.result.ten_sinhvien);
                $('#namSinhUpdate').val(data.result.namsinh);
                $('#maLopUpdate').val(data.result.ma_lop);
            }
        })
        .catch(err => console.error(err));
}

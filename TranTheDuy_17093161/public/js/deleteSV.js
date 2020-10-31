
function xoa(id) {
    var URL = "http://localhost:5000/quanlysinhvien";
    var xoa = confirm("Bạn có chắc chắn xoá?");
    if (xoa) {
        $.post(URL + '/delete/' + id, data => {
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
    var URL = "http://localhost:5000/quanlysinhvien/" + id;
    fetch(URL).then(response => response.json())
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

function xoa(id) {
    var xoa = confirm("Bạn có chắc chắn xoá?");
    var URL = "/quanlysinhvien/delete/";
    if (xoa) {
        fetch(URL + id, {
            method: "DELETE",
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                alert("Xoá thành công");
                window.location.href = "/quanlysinhvien";
            })
            .catch(err => {
                console.error(err);
                alert("Xoá thất bại");
            })
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

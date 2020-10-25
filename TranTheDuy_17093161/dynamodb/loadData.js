var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "ap-southeast-1",
    endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

/**
 * Load data từ file sinhvien-data.json
 */
var sinhviens = JSON.parse(fs.readFileSync('sinhviendata.json', 'utf8'));

sinhviens.forEach(function (sv) {
    var params = {
        TableName: "SinhViens",
        Item: {
            "id": sv.id,
            "ma_sinhvien": sv.ma_sinhvien,
            "ten_sinhvien": sv.ten_sinhvien,
            "namsinh": sv.namsinh,
            "ma_lop": sv.ma_lop,
            "avatar": sv.avatar
        }
    };

    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Không thể thêm sinh viên", sv.ten_sinhvien, JSON.stringify(err, null, 2));
        } else {
            console.log("Thêm thành công sinh viên", sv.ten_sinhvien);
        }
    });
});
var AWS = require("aws-sdk");
require('dotenv').config({ path: '../.env' });

AWS.config.update({
    region: "ap-southeast-1", // Chọn vị trí theo tài khoản
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_PRIVATE
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: "SinhViens"
};

docClient.scan(params, onScan);

function onScan(err, data) {
    console.log(data);
    if (err) {
        console.error("Không thể xem toàn bộ sinh viên.", JSON.stringify(err, null, 2));
    } else {
        /**
         * In toàn bộ sinh viên
         */
        data.Items.forEach(function (sv) {
            console.log(sv.id + ", " +
                sv.ma_sinhvien + ", " +
                sv.ten_sinhvien + ", " +
                sv.namsinh + ", " +
                sv.ma_lop + ", " +
                sv.avatar);
        });

        /**
         * Tiếp tục in ra tiếp các sinh viên nếu chưa in ra hết tất cả
         */
        if (typeof data.LastEvaluatedKey != "undefined") {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }
    }
}
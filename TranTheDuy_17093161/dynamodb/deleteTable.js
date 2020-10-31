var AWS = require("aws-sdk");
var fs = require('fs');
require('dotenv').config({ path: '../.env' });

AWS.config.update({
    region: "ap-southeast-1", // Chọn vị trí theo tài khoản
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_PRIVATE
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "SinhViens"
};

dynamodb.deleteTable(params, function (err, data) {
    if (err) {
        console.error("Xoá bảng không thành công", JSON.stringify(err, null, 2));
    } else {
        console.log("Xoá bảng thành công", JSON.stringify(data, null, 2));
    }
});
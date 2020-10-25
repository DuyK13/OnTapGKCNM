var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "ap-southeast-1",
    endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com"
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
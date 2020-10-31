/**
 * Tạo bảng SinhViens
 */

var AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-1", // Chọn vị trí theo tài khoản
});

var dynamodb = new AWS.DynamoDB();

/**
 * Khởi tạo bảng SinhViens
 * gồm hai khoá như dưới
 */
var params = {
    TableName: "SinhViens",
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH" },  //Partition key
        { AttributeName: "ma_sinhvien", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "ma_sinhvien", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};

/**
 * Tạo bảng
 */
dynamodb.createTable(params, function (err, data) {
    if (err) {
        console.error("Tạo bảng có lỗi: \n", JSON.stringify(err, null, 2));
    } else {
        console.log("Tạo bảng thành công: \n", JSON.stringify(data, null, 2));
    }
});
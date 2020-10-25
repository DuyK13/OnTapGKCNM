var AWS = require("aws-sdk");

AWS.config.update({
    region: "ap-southeast-1",
    endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();

/**
 * Cấu hình của bảng
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
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function (err, data) {
    if (err) {
        console.error("Không thể tạo bảng.\n", JSON.stringify(err, null, 2));
    } else {
        console.log("Tạo bảng thành công. \n", JSON.stringify(data, null, 2));
    }
});
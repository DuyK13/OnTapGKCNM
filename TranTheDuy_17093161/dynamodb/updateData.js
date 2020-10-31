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
var params = {
    TableName: "SinhViens",
    Key: {
        "id": "8e52494b-ad6b-4234-b66c-e516ce37e28b",
        "ma_sinhvien": "17093161"
    },
    UpdateExpression: "set avatar.fileName=:a, avatar.src=:b",
    ExpressionAttributeValues: {
        ":a": "h1.png ",
        ":b": "https://tran-the-duy-208.s3-ap-southeast-1.amazonaws.com/h1.png",
    },
    ReturnValues: "UPDATED_NEW"
};

console.log("Updating the item...");
docClient.update(params, function (err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
});
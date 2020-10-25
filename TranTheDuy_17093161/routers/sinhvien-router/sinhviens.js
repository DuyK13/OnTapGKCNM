const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const AWS = require("aws-sdk");
const multer = require('multer');
require('dotenv').config();
var sinhviens = [];

AWS.config.update({
    region: "ap-southeast-1",
});

const s3 = new AWS.S3();

const storage = multer.memoryStorage({
    destination: (req, file, callback) => {
        callback(null, '')
    }
})

const upload = multer({ storage }).single('avatar')

const docClient = new AWS.DynamoDB.DocumentClient();

// Thêm sinh viên
router.post('/add', upload, async (req, res) => {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    let avaURL = null;

    let paramsS3 = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuid.v4()}.${fileType}`,
        Body: req.file.buffer
    };

    s3.upload(paramsS3, (err, data) => {
        if (err) {
            res.status(500).send(err);
        }
        let params = {
            TableName: "SinhViens",
            Item: {
                "id": uuid.v4(),
                "ma_sinhvien": req.body.maSV,
                "ten_sinhvien": req.body.tenSV,
                "namsinh": req.body.namSinh,
                "ma_lop": req.body.maLop,
                "avatar": data.Location,
            }
        };

        docClient.put(params, (err1, data1) => {
            if (err1) {
                console.error("Không thêm được sinh viên", JSON.stringify(err1, null, 2));
                res.redirect('/');
            } else {
                console.log("Đã thêm", JSON.stringify(data1, null, 2));
            }
        });
        // res.status(200).redirect('/quanlysinhvien');
        res.status(200);
        res.redirect("/quanlysinhvien")
    })

})

// Đọc dữ liệu bảng SinhViens

router.get('/', (req, res) => {
    let params = {
        TableName: "SinhViens"
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            console.error("Không có dự liệu trong bảng", JSON.stringify(err, null, 2));
            res.redirect('/');
        } else {
            if (typeof data.LastEvaluatedKey != "undefined") {
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
            sinhviens = data.Items;
            res.render('index', { title: 'Quản lý sinh viên', sinhviens });
        }
    });
})

// Xoá sinh viên
router.delete('/add/:id', (req, res) => {

})


module.exports = router;
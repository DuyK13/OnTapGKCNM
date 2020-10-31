const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const AWS = require("aws-sdk");
const multer = require('multer');
require('dotenv').config();

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

const updateUpload = multer({ storage }).single('avatarUpdate')

const docClient = new AWS.DynamoDB.DocumentClient();

// Thêm sinh viên
router.post('/add', upload, (req, res) => {
    // Tạo promise để xử lý lưu sinh viên
    let saveSinhVien = new Promise((resolve, reject) => {
        // Lấy đuôi file từ trong file
        // const myFile = req.file.originalname.split(".");
        // const fileType = myFile[myFile.length - 1];

        /**
         * Params upload ảnh s3
         * Tên bucket
         * Key là tên file kèm loại
         * Body là dữ liệU file
         */
        let params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            // Key: `${uuid.v4()}.${fileType}`,
            Key: req.file.originalname,
            Body: req.file.buffer
        };

        // Upload file lên s3
        s3.upload(params, (err, data) => {
            if (err) {
                reject(err); // Thất bại thì reject ra err
            } else {
                resolve(data); // Thành công thì reslove data
            }
        })
    });

    /**
     * Nếu thành công thì sẽ lấy tiếp data ở trên làm tiếp
     */
    saveSinhVien.then(result => {
        /**
         * Params để thêm sinh viên
         * các thông tin của sinh viên
         */
        let params = {
            TableName: "SinhViens",
            Item: {
                "id": uuid.v4(),
                "ma_sinhvien": req.body.maSV,
                "ten_sinhvien": req.body.tenSV,
                "namsinh": req.body.namSinh,
                "ma_lop": req.body.maLop,
                "avatar": {
                    "src": result.Location,
                    "fileName": result.Key,
                }
            }
        };

        // Thêm sinh viên vào dynamodb
        docClient.put(params, (err, data) => {
            if (err) {
                res.status(500).render('error', { title: '500, Internal Server Error', error: err, msg: 'Không thêm được sinh viên', url: req.url }); // Thất bại thì sẽ chuyển sang trang lỗi
            } else {
                res.status(200).redirect('/quanlysinhvien'); // Thành công thì sẽ chuyển sang trang quản lý
            }
        });
    })

    saveSinhVien.catch(err => {
        res.status(500).render('error', { title: '500, Internal Server Error', error: err, msg: 'Không upload được ảnh', url: req.url }); // Chuyển sang trang lỗi kèm thông tin lỗi
    })
})

// Xoá sinh viên
router.post('/delete/:id', (req, res) => {

    // Tạo promise để xử lý xoá sinh viên
    let getSinhVien = new Promise((resolve, reject) => {
        // Params gồm thông số về id để tìm sinh viên
        let params = {
            TableName: "SinhViens",
            KeyConditionExpression: "#id = :id",
            ExpressionAttributeNames: {
                "#id": "id"
            },
            ExpressionAttributeValues: {
                ":id": req.params.id
            }
        };

        // Query để tìm sinh viên trong bảng SinhViens
        docClient.query(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.Items.find(x => x.id === req.params.id));
            }
        });
    });

    // Lấy thông tin sinh viên vừa tìm để xoá
    getSinhVien.then(result => {
        let params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: result.avatar.fileName
        };

        // Xoá ảnh trong s3 trước
        s3.deleteObject(params, (err, data) => {
            if (err) {
                res.status(500).render('error', { title: '500, Internal Server Error', error: err, msg: 'Không tìm thấy ảnh trên s3', url: req.url }); // Lỗi sẽ chuyển về trang lỗi
            } else {
                return result;// Trả về thông tin sinh viên
            }
        })
    })

    // Xoá sinh viên trong dynamodb
    getSinhVien.then(result => {
        // Param để xoá sinh viên
        let params = {
            TableName: "SinhViens",
            Key: {
                "id": result.id,
                "ma_sinhvien": result.ma_sinhvien
            }
        };

        // Xoá sinh viên trong dynamodb
        docClient.delete(params, (err, data) => {
            if (err) {
                res.status(500).render('error', { title: '500, Internal Server Error', error: err, msg: 'Không xoá được sinh viên', url: req.url });
            } else {
                res.status(200).redirect('/quanlysinhvien');
            }
        })
    })

    // Lỗi không tìm thấy sinh viên
    getSinhVien.catch(err => {
        res.status(500).render('error', { title: '500, Internal Server Error', error: err, msg: 'Không tìm thấy sinh viên', url: req.url });
    })
})



// Đọc dữ liệu bảng SinhViens
router.get('/', (req, res) => {
    // Tìm tát cả sinh viên
    let getAllSV = new Promise((resolve, reject) => {
        // params bảng
        let params = {
            TableName: "SinhViens"
        };

        // Scan mọi sinh viên phù hợp với params
        docClient.scan(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                // Đọc tiếp nếu tìm chưa hết
                if (typeof data.LastEvaluatedKey != "undefined") {
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    docClient.scan(params, onScan);
                }
                resolve(data.Items);
            }
        });
    })

    // Lấy mảng sinh viên render sang trang index
    getAllSV.then(result => {
        let sinhviens = result;
        res.status(200).render('index', { title: 'Quản lý sinh viên', sinhviens });
    })

    // Bắt lỗi không tìm thấy sinh viên
    getAllSV.catch(err => {
        res.status(500).render('error', { title: '500, Internal Server Error', error: err, msg: 'Không tìm thấy sinh viên', url: req.url });
    })
})

// Đọc dữ liệu bảng SinhViens
router.get('/:id', (req, res) => {
    // Tạo promise để xử lý xoá sinh viên
    let getSinhVien = new Promise((resolve, reject) => {
        // Params gồm thông số về id để tìm sinh viên
        let params = {
            TableName: "SinhViens",
            KeyConditionExpression: "#id = :id",
            ExpressionAttributeNames: {
                "#id": "id"
            },
            ExpressionAttributeValues: {
                ":id": req.params.id
            }
        };

        // Query để tìm sinh viên trong bảng SinhViens
        docClient.query(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.Items.find(x => x.id === req.params.id));

            }
        });
    });

    // Trả về sinh viên
    getSinhVien.then(result => {
        res.json({ error_code: 1, result });
    })

    // Trả về lỗi
    getSinhVien.catch(error => {
        res.json({ error_code: 0, error });
    })
})

// Cập nhật sinh viên
router.post('/update', updateUpload, (req, res) => {
    // Tạo promise để xử lý lưu sinh viên
    let updateSinhVien = new Promise((resolve, reject) => {
        if (req.file) {
            /**
             * Params upload ảnh s3
             * Tên bucket
             * Key là tên file kèm loại
             * Body là dữ liệU file
             */
            let params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: req.file.originalname,
                Body: req.file.buffer
            };

            // Upload file lên s3
            s3.upload(params, (err, data) => {
                if (err) {
                    reject(err); // Thất bại thì reject ra err
                } else {
                    resolve(data); // Thành công thì reslove data
                }
            })
        }
        else {
            resolve(null);
        }
    });

    /**
     * Nếu thành công thì sẽ lấy tiếp data ở trên làm tiếp
     */
    updateSinhVien.then(result => {
        /**
         * Params để thêm sinh viên
         * các thông tin của sinh viên
         */
        if (result !== null) {
            let params = {
                TableName: "SinhViens",
                Key: {
                    "id": req.body.idUpdate,
                    "ma_sinhvien": req.body.maSVUpdate
                },
                UpdateExpression: "set avatar.fileName=:a, avatar.src=:b, ma_lop=:c, namsinh=:d, ten_sinhvien=:e",
                ExpressionAttributeValues: {
                    ":a": result.Key,
                    ":b": result.Location,
                    ":c": req.body.maLopUpdate,
                    ":d": req.body.namSinhUpdate,
                    ":e": req.body.tenSVUpdate

                },
                ReturnValues: "UPDATED_NEW"
            };
            // Cập nhật sinh viên vào dynamodb
            docClient.update(params, (err, data) => {
                if (err) {
                    console.log(err);
                    // res.status(500).render('error', { title: '500, Internal Server Error', error: err, msg: 'Không cập nhật được sinh viên', url: req.url }); // Thất bại thì sẽ chuyển sang trang lỗi
                } else {
                    res.status(200).redirect('/quanlysinhvien'); // Thành công thì sẽ chuyển sang trang quản lý
                }
            });
        } else {
            let params = {
                TableName: "SinhViens",
                Key: {
                    "id": req.body.idUpdate,
                    "ma_sinhvien": req.body.maSVUpdate
                },
                UpdateExpression: "set ma_lop=:c, namsinh=:d, ten_sinhvien=:e",
                ExpressionAttributeValues: {
                    ":c": req.body.maLopUpdate,
                    ":d": req.body.namSinhUpdate,
                    ":e": req.body.tenSVUpdate

                },
                ReturnValues: "UPDATED_NEW"
            };

            // Cập nhật sinh viên vào dynamodb
            docClient.update(params, (err, data) => {
                if (err) {
                    res.status(500).render('error', { title: '500, Internal Server Error', error: err, msg: 'Không cập nhật được sinh viên', url: req.url }); // Thất bại thì sẽ chuyển sang trang lỗi
                } else {
                    res.status(200).redirect('/quanlysinhvien'); // Thành công thì sẽ chuyển sang trang quản lý
                }
            });
        }
    })
})
module.exports = router;
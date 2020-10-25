const express = require('express');
const path = require('path');
const app = express();
const exphbds = require('express-handlebars');
const PORT = process.env.PORT || 5000;
const svRoute = require('./routers/sinhvien-router/sinhviens');

/**
 * Trỏ thư mục static lưu trữ css, js của html để sử dụng
 */
app.use(express.static(path.join(__dirname, '/public')));

/**
 * Sử dụng handlebars middleware
 */
app.engine('handlebars', exphbds({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

/**
 * Body parse middleware để sử dụng JSON, mảng JSON
 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * API quản lý sinh viên
 */
app.use('/quanlysinhvien', svRoute);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
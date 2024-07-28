const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    if (intentName === 'CheckProduct') {
        const productInput = removeVietnameseTones(parameters.ProductName); // Lấy giá trị sản phẩm từ parameter

        try {
            // Gọi API từ backend của bạn
            const response = await axios.get(
                'https://thuc-pham-sach-be.onrender.com/api/product/searchSimple?name=' + encodeURIComponent(productInput)
            );
            // Đảm bảo rằng API trả về dữ liệu mong đợi
            if (response.data.success && response.data.products) {
                const products = response.data.products;

                // Kiểm tra số lượng sản phẩm tìm thấy
                if (products.length === 0) {
                    return res.json({
                        fulfillmentText: 'Xin lỗi, không tìm thấy thông tin sản phẩm bạn yêu cầu.',
                    });
                } else if (products.length === 1) {
                    const product = products[0];
                    const responseText = `Chúng tôi có sản phẩm ${product.name}. Mô tả: ${product.description}. Giá: ${product.price} VND.`;

                    return res.json({
                        fulfillmentText: responseText,
                    });
                } else {
                    let responseText = 'Chúng tôi tìm thấy nhiều sản phẩm phù hợp: \n';
                    products.forEach((product, index) => {
                        responseText += `${index + 1}. ${product.name}: ${product.price} VND. Mô tả: ${product.description}\n`;
                    });

                    return res.json({
                        fulfillmentText: responseText,
                    });
                }
            } else {
                return res.json({
                    fulfillmentText: 'Xin lỗi, không tìm thấy thông tin sản phẩm bạn yêu cầu.',
                });
            }
        } catch (error) {
            console.error('Error calling backend API:', error);
            return res.json({
                fulfillmentText: 'Xin lỗi, tôi không thể truy xuất thông tin sản phẩm vào lúc này.' + error,
            });
        }
    } else {
        return res.json({
            fulfillmentText: 'Xin lỗi, tôi không hiểu yêu cầu của bạn.',
        });
    }
});

function removeVietnameseTones(stra) {
    var str = stra;
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, ' ');
    return str;
}

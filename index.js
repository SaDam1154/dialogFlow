const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    if (intentName === 'CheckProduct') {
        const productInput = parameters.product; // Lấy giá trị sản phẩm từ parameter

        try {
            // Gọi API từ backend của bạn
            const response = await axios.get('https://thuc-pham-sach-be.onrender.com/api/product/18');
            // Đảm bảo rằng API trả về dữ liệu mong đợi
            if (response.data.success && response.data.product) {
                const product = response.data.product;

                // Tạo phản hồi từ dữ liệu API
                const responseText = `Chúng tôi có sản phẩm ${product.name}. Mô tả: ${product.description}. Giá: ${product.price} VND.`;

                return res.json({
                    fulfillmentText: responseText,
                });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

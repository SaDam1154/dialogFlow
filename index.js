const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    if (intentName === 'CheckProduct') {
        // Thay 'CheckProduct' bằng tên Intent của bạn
        const productInput = parameters.product; // Lấy giá trị sản phẩm từ parameter

        try {
            // Gọi API từ backend của bạn
            const response = await axios.get('https://thuc-pham-sach-be.onrender.com/api/product/18');

            const product = response.product;

            // Tạo phản hồi từ dữ liệu API
            const responseText = `Chúng tôi có sản phẩm ${product.name}. Mô tả: ${product.description}. Giá: ${product.price} VND.`;

            return res.json({
                fulfillmentText: responseText,
            });
        } catch (error) {
            console.error('Error calling backend API:', error);
            return res.json({
                fulfillmentText: 'Xin lỗi, tôi không thể truy xuất thông tin sản phẩm vào lúc này.',
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

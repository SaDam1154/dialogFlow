const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    if (intentName == 'Chào_hỏi_Intent') {
        const content = [
            'Tìm kiếm sản phẩm',
            'Thông tin các chương trình khuyến mãi',
            'Thông tin loại thực phẩm như: khô, đông lạnh, đóng hộp, ngũ cốc, nấm, rau củ quả, trái cây...',
            'Thông tin về thời gian giao hàng.',
            'Thông tin về phí giao hàng.',
            'Thông tin về chính sách đổi trả sản phẩm.',
            'Cách thức đánh giá, phản hồi.',
        ];
        const fulfillmentMessages = [
            {
                text: {
                    text: [
                        'Chào bạn! Tôi là trợ lý ảo của cửa hàng thực phẩm sạch.Bạn muốn được hỗ trợ gì? Hãy cho tôi biết để tôi có thể giúp bạn.',
                    ],
                },
            },
            {
                text: {
                    text: ['Dưới đây là một vài nội dung gợi ý:'],
                },
            },
            ...content.map((content, index) => {
                return {
                    text: {
                        text: [`${index + 1}. ${content}.`],
                    },
                };
            }),
        ];

        return res.json({
            fulfillmentMessages: fulfillmentMessages,
        });
    }
    if (intentName == 'promotion-program') {
        try {
            // Gọi API từ backend của bạn
            const response = await axios.get('https://thuc-pham-sach-be.onrender.com/api/promotion-program');
            console.log(response.data);
            // Đảm bảo rằng API trả về dữ liệu mong đợi
            if (response.data.success && response.data.promotionPrograms) {
                const promotionPrograms = response.data.promotionPrograms;
                // Kiểm tra số lượng sản phẩm tìm thấy
                if (promotionPrograms.length == 0) {
                    return res.json({
                        fulfillmentText: 'Xin lỗi, hiện tại không có chương trình khuyến mãi tại cửa hàng.',
                    });
                } else if (promotionPrograms.length == 1) {
                    const promotionProgram = promotionPrograms[0];
                    const responseText = `Chúng tôi có sản phẩm đang có chương trình khuyến mãi : ${promotionProgram.description}.`;

                    return res.json({
                        fulfillmentText: responseText,
                    });
                } else {
                    const fulfillmentMessages = [
                        {
                            text: {
                                text: ['Chúng tôi đang có những chương trình khuyến mãi sau:'],
                            },
                        },
                        ...promotionPrograms.slice(0, 3).map((Program, index) => {
                            return {
                                text: {
                                    text: [`${index + 1}. ${Program.description}.`],
                                },
                            };
                        }),
                    ];

                    return res.json({
                        fulfillmentMessages: fulfillmentMessages,
                    });
                }
            } else {
                return res.json({
                    fulfillmentText: 'Xin lỗi, không tìm thấy thông tin bạn yêu cầu.',
                });
            }
        } catch (error) {
            console.error('Error calling backend API:', error);
            return res.json({
                fulfillmentText: 'Xin lỗi, tôi không thể truy xuất thông tin chương trình khuyến mãi vào lúc này.',
            });
        }
    }

    if (intentName == 'CheckProduct') {
        if (parameters.ProductName.length == 1) {
            const productInput = removeVietnameseTones(parameters.ProductName[0].toString()); // Lấy giá trị sản phẩm từ parameter
            console.log(productInput);

            try {
                // Gọi API từ backend của bạn
                const response = await axios.get('https://thuc-pham-sach-be.onrender.com/api/product/searchSimple?name=' + productInput);
                console.log(response.data);
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
                        const responseText = `Chúng tôi có sản phẩm ${product.name}. Giá: ${product.priceDiscounted} VND. Mô tả: ${product.description}.`;

                        return res.json({
                            fulfillmentText: responseText,
                        });
                    } else {
                        const fulfillmentMessages = [
                            {
                                text: {
                                    text: ['Chúng tôi tìm thấy các sản phẩm tương ứng là:'],
                                },
                            },
                            ...products.slice(0, 3).flatMap((product, index) => [
                                {
                                    text: {
                                        text: [`${index + 1}. Sản phẩm ${product.name}: ${product.description}.`],
                                    },
                                },
                                {
                                    text: {
                                        text: [`Giá sản phẩm: ${product.priceDiscounted} VND.`],
                                    },
                                },
                            ]),
                        ];

                        return res.json({
                            fulfillmentMessages: fulfillmentMessages,
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
                    fulfillmentText: 'Xin lỗi, tôi không thể truy xuất thông tin sản phẩm vào lúc này.',
                });
            }
        } else {
            const productInput1 = removeVietnameseTones(parameters.ProductName[0].toString()); // Lấy giá trị sản phẩm từ parameter
            console.log(productInput1);
            const productInput2 = removeVietnameseTones(parameters.ProductName[1].toString()); // Lấy giá trị sản phẩm từ parameter
            console.log(productInput1);

            try {
                // Gọi API từ backend của bạn
                const response1 = await axios.get('https://thuc-pham-sach-be.onrender.com/api/product/searchSimple?name=' + productInput1);
                const response2 = await axios.get('https://thuc-pham-sach-be.onrender.com/api/product/searchSimple?name=' + productInput2);
                if (response1.data.success && response2.data.success) {
                    const products = response1.data.products;
                    const products2 = response2.data.products;
                    const fulfillmentMessages = [
                        {
                            text: {
                                text: ['Chúng tôi tìm thấy các sản phẩm tương ứng là:'],
                            },
                        },
                        ...products.slice(0, 3).flatMap((product, index) => [
                            {
                                text: {
                                    text: [`${index + 1}. Sản phẩm ${product.name}: ${product.description}.`],
                                },
                            },
                            {
                                text: {
                                    text: [`Giá sản phẩm: ${product.priceDiscounted} VND.`],
                                },
                            },
                        ]),
                        ...products2.slice(0, 3).flatMap((product, index) => [
                            {
                                text: {
                                    text: [`${index + 1 + products.length}. Sản phẩm ${product.name}: ${product.description}.`],
                                },
                            },
                            {
                                text: {
                                    text: [`Giá sản phẩm: ${product.priceDiscounted} VND.`],
                                },
                            },
                        ]),
                    ];

                    return res.json({
                        fulfillmentMessages: fulfillmentMessages,
                    });
                }
            } catch (error) {
                console.error('Error calling backend API:', error);
                return res.json({
                    fulfillmentText: 'Xin lỗi, tôi không thể truy xuất thông tin sản phẩm vào lúc này.',
                });
            }
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

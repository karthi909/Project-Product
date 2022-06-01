const orderModel = require('../models/orderModel')
const validation = require('../validations/validation')
const cartModel = require('../models/cartModel')


const createOrder = async function (req, res) {
    try {
        let userIdFromParams = req.params.userId

        const requestBody = req.body
        const { cancellable, status } = requestBody




        const cart = await cartModel.findOne({ userId: userIdFromParams })





        let totalQuantity = 0;
        const cartItems = cart.items;

        cartItems.forEach((items) => (totalQuantity += items.quantity));


        const newOrder = {
            userId: userIdFromParams,
            items: cart.items,
            totalPrice: cart.totalPrice,
            totalItems: cart.totalItems,
            totalQuantity: totalQuantity,
            cancellable, status
        };


        const createOrder = await orderModel.create(newOrder)
        console.log("6", createOrder)
        return res.status(201).send({ status: true, data: createOrder })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}









module.exports = { createOrder }
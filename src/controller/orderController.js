const orderModel = require('../models/orderModel')
const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const validation = require('../validations/validation')


const createOrder = async function (req, res) {
    try {
        let data = req.body
        let userId = req.params.userId
        //console.log(userId)
        let { cartId, cancellable, status } = data
        
        if (!validation.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "No data found" })

        if (!validation.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "User Id is not valid" })

        if (!validation.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Cart Id is not valid" })

        if(!validation.isValid(cartId)) return res.status(400).send({ status: false, message: "Cart Id is required" })

        let findUser = await userModel.findOne({ _id: userId })
        if (findUser == null) return res.status(404).send({ status: false, message: "User not found" })

        // Authentication
        let tokenId = req.userId
        // console.log("2", tokenId)
        if (tokenId != userId) return res.status(401).send({ status: false, message: "Unauthorised Access" })

        

        let findCart = await cartModel.findOne({ _id: cartId })
        if (findCart == null) return res.status(404).send({ status: false, message: "Cart not found" })

        let findUserCart = await cartModel.findOne({ userId: userId })
        // console.log(findUserCart.userId.toString())
        // console.log(findCart.userId.toString())
        if ((findUserCart.userId.toString()) != (findCart.userId.toString()))
            return res.status(404).send({ status: false, message: "Cart is not belongs to the User" })

        if (cancellable) {
            if (!(cancellable == true || cancellable == false)) return res.status(400).send({ status: false, message: 'cancellable key should be true or false' })
        }

        if (status) {
            if (["pending", "completed", "canclled"].indexOf(status) == -1) {
                return res.status(400).send({ status: false, message: "Status should be 'pending', 'completed' or 'canclled'" })
            }
        }

        if (findCart.items.length == 0) return res.status(400).send({ status: false, message: "Product is not added in this cart" })

        let totalQuantity = 0;
        for (let i = 0; i < findCart.items.length; i++) {

            totalQuantity = totalQuantity + findCart.items[i].quantity

        }

        // console.log(findCart.totalItems)

        let order = { userId: userId, items: findCart.items, totalPrice: findCart.totalPrice, totalItems: findCart.totalItems, totalQuantity: totalQuantity, cancellable, status }

        let orderDetails = await orderModel.create(order)

        await cartModel.findByIdAndUpdate({_id: cartId}, {$set: {items: [], totalPrice: 0, totalItems: 0}})

        return res.status(201).send({ status: true, message: "Order created successfully", data: orderDetails })



    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const updateOrder = async function(req, res){
    try{
        let data = req.body
        let userId = req.params.userId
        let { orderId, status } = data

        if (!validation.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "No data found" })

        if (!validation.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "User Id is not valid" })

        if(!validation.isValid(orderId)) return res.status(400).send({ status: false, message: "Order Id required" })

        if (!validation.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Order Id is not valid" })

        if(!validation.isValid(status)) return res.status(400).send({ status: false, message: "Status is required for updatation" })

        // Authentication
        let tokenId = req.userId
        // console.log(tokenId)
        if (tokenId != userId) return res.status(401).send({ status: false, message: "Unauthorised Access" })

        let findUser = await userModel.findOne({ _id: userId })
        if (findUser == null) return res.status(404).send({ status: false, message: "User is not found" })

        let findOrder = await orderModel.findOne({_id: orderId})
        if (findOrder == null) return res.status(404).send({ status: false, message: "Order is not found" })

        // console.log(findOrder.userId.toString())
        if(findUser._id.toString() != findOrder.userId.toString()) return res.status(400).send({ status: false, message: "Order is not belong to the user" })

        
        if(findOrder.cancellable == false) return res.status(400).send({ status: false, message: "You cant't cancel the order, Order is not cancellable" })

        if (["pending", "completed", "canclled"].indexOf(status) == -1) {
            return res.status(400).send({ status: false, message: "Status should be 'pending', 'completed' or 'canclled'" })
        }

        if(findOrder.status == "completed") return res.status(400).send({ status: false, message: "Order is already completed, you cant't update" })

        if(findOrder.status == "canclled") return res.status(400).send({ status: false, message: "Order is already cancelled, you cant't update" })

        const updateOrder = await orderModel.findOneAndUpdate({_id: orderId, isDeleted: false}, {status: status}, {new: true})

        if(updateOrder == null) {
            return res.status(404).send({ status: false, message: "Order is not found or deleted" })
        }

        return res.status(200).send({ status: true, message: "Order status updated successfully", order:updateOrder })


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}




module.exports = { createOrder, updateOrder }
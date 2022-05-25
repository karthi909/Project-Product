const express = require('express');
const router = express.Router();
const middleware = require('../middleware/authorization')
const productController = require('../controller/productController')

const userController=require('../controller/userController');


router.post('/register',userController.createUser) 

router.post('/login', userController.loginUser)

router.get('/user/:userId/profile', middleware.authorizatoion ,userController.getUserList)

router.put('/user/:userId/profile', middleware.authorizatoion ,userController.updateUserList)


router.post('/products', productController.createProduct)


module.exports = router
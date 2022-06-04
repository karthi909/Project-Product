const jwt = require("jsonwebtoken")



const authorization = async function (req, res, next) {
  try {
    const token = req.header("Authorization") //setting token in the request header.
    console.log(token)
    if (!token) {
      return res.status(403).send({ status: false, message: `Missing authentication token in request` })
    }
    tokenNew = token.split(' ')
    let requiredToken = tokenNew[1]

    const decoded = jwt.verify(requiredToken, 'Uranium Project-5'); //decoding authentication token

    if (!decoded) {
      return res.status(400).send({ status: false, message: "Invalid authentication token in request headers." })
    }


    //console.log(decoded)

    req.userId = decoded.userID; //matching userId for which token generated by the userId provided in the request.
    // console.log("1",req.userId)
    next()

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}





module.exports.authorization = authorization;




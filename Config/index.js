require('dotenv').config()

module.exports = {
    port: process.env.SERVER_PORT,
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    JWTSecret: process.env.JWT_SECRET,
    JWTExpirationTime: process.env.JWT_EXPIRATION_TIME
}
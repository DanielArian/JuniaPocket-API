require('dotenv').config()

module.exports = {
    port: process.env.SERVER_PORT,
    dbCluster: process.env.CLUSTER,
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    JWTSecret: process.env.JWT_SECRET,
    JWTExpirationTime: process.env.JWT_EXPIRATION_TIME,
    AESSecurityKey: process.env.SECURITY_KEY,
    AESInitVector: process.env.INIT_VECTOR
}
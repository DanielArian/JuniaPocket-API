/**
 * Autorise l'accès aux requêtes si l'utilisateur fourni le bon token
 * d'authenfication.
 */

const jwt = require('jsonwebtoken');
const config = require('../Config/index');
const sCode = require('../httpStatus');

exports.auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
            throw new Error('Echec Authentication !');
        }
        const verified = jwt.verify(token, config.JWTSecret);
        req.user = verified;
        next();
    } catch (error) {
        console.log(`auth --> ${error}`);
        res.status(sCode.badRequest).json({error: 'Token invalide !'});
    }
};
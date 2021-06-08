/**
 * Autorise l'accès aux requêtes si l'utilisateur fourni le bon token
 * d'authenfication.
 */

const jwt = require('jsonwebtoken');
const config = require('../Config/index');
const sCode = require('../httpStatus');

exports.auth = (req, res, next) => {
    // Nécessite d'envoyer le Bearer Token dans le headers authorization

    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
            res.status(sCode.unauthorized).json({error: 'Echec authentification !'});
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET || config.JWTSecret);
        req.user = verified;
        console.log('req.user = ', req.user);
        next();
    } catch (error) {
        console.log(`auth --> ${error}`);
        res.status(sCode.badRequest).json({error: 'Token invalide !'});
    };
};
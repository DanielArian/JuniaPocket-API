/**
 * Autorise l'accès aux requêtes si l'utilisateur fourni le bon token
 * d'authenfication.
 */

const jwt = require('jsonwebtoken');
const config = require('../Config/index');
const  db = require('../Database/index');
const sCode = require('../httpStatus');

exports.auth = async (req, res, next) => {
    // Nécessite d'envoyer le Bearer Token dans le headers authorization

    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
            res.status(sCode.unauthorized).json({error: 'ECHEC_AUTHENTIFICATION'});
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET || config.JWTSecret);
        req.user = verified;
        console.log('req.user = ', req.user);
        let isUserStillRegistered = await db.Models.User.findOne({aurionID: req.user.aurionID})
        if (!isUserStillRegistered) {
            console.log('auth --> token valide mais utilisateur désinscrit');
            return res.status(sCode.unauthorized).json({error: `UTILISATEUR_NON_EXISTANT`});
        }
        next();
    } catch (error) {
        console.log(`auth --> ${error}`);
        return res.status(sCode.badRequest).json({error: 'TOKEN_INVALIDE'});
    };
};
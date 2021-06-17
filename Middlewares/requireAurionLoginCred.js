const sCode = require('../httpStatus');
const db = require('../Database/index');

exports.requireAurionLoginCred = async (req, res, next) => {

    if (req.body.hasOwnProperty('aurionID') &
        req.body.hasOwnProperty('aurionPassword')
        ) {
        next();
    }
    else {
        console.log('requireAurionLoginCred --> Paramètre(s) manquant(s)');
        res.status(sCode.badRequest).json({error: 'Bad Request : il manque au moins un paramètre.'});
    }
}
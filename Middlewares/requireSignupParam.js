const sCode = require('../httpStatus');

exports.requireSignupParam = (req, res, next) => {
    if (req.body.hasOwnProperty('aurionID') &
        req.body.hasOwnProperty('aurionPassword') &
        req.body.hasOwnProperty('jpocketPassword')
        ) {
        next();
    }
    else {
        console.log('requireSignupParam --> Paramètre(s) manquant(s)');
        res.status(sCode.badRequest).json({error: 'Bad Request : il manque au moins un paramètre.'});
    }
}
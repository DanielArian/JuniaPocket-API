const sCode = require('../httpStatus');

exports.requireLoginParam = (req, res, next) => {

    if (req.body.hasOwnProperty('aurionID') &
        req.body.hasOwnProperty('jpocketPassword')
        ) {
        next();
    }
    else {
        console.log('requireLoginParam --> Paramètre(s) manquant(s)');
        res.status(sCode.badRequest).json({error: 'Bad Request : il manque au moins un paramètre.'});
    }
}
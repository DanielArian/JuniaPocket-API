const sCode = require('../httpStatus');

exports.requireAvailableRoomReqParam = async (req, res, next) => {

    if (req.body.hasOwnProperty('date') &
        req.body.hasOwnProperty('beginTime') &
        req.body.hasOwnProperty('timeToSpendInRoom')
        ) {
        next();
    }
    else {
        console.log('requireAvailableRoomReqParam --> Paramètre(s) manquant(s)');
        res.status(sCode.badRequest).json({error: 'Bad Request : il manque au moins un paramètre.'});
    }
}
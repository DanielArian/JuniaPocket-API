const sCode = require('../httpStatus');
const db = require('../Database/index');

exports.requireExistingMarkDoc = async (req, res, next) => {
    console.log('------ Inside Middleware: requireExistingMarkDoc ');

    let aurionID = req.user.aurionID;
    let userMarkDoc = await db.search.findUserByAurionIDInCollection(aurionID, db.Models.Mark);
    if (userMarkDoc != 'USER_DOES_NOT_EXIST_IN_COLLECTION' &
        userMarkDoc != 'ERROR') {
            next();
    }
    else {
        res.status(sCode.notFound).json({error: 'Impossible de mettre à jour un document qui n\'existe pas.'});
    }
}
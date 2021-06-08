const sCode = require('../httpStatus');
const db = require('../Database/index');

exports.requireUserNotAlreadyRegistered = async (req, res, next) => {

    let aurionID = req.body.aurionID;
    let userDoc = await db.search.findUserByAurionIDInCollection(aurionID, db.Models.User);
    if (userDoc != 'USER_DOES_NOT_EXIST_IN_COLLECTION') {
        res.status(sCode.conflict).json({error: 'Utilisateur déjà inscrit !'});
    }
    else {
        next();
    }
}
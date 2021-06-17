const sCode = require('../httpStatus');

// isCurrentlyGettingPlanninfForTheFirstTime

exports.isCurrentlyGettingPlanninfFTFT = async (req, res, next) => {
    /**
     * A APPELER APRES LE MIDDLEWARE AUTH
     * Laisse passer la requête /planning/get-week ssi l'utilisateur n'est pas en train de
     * faire sa première récupération de planning, afin qu'il n'ait pas un doublon de doc de planning.
     */

    let aurionID = req.user.aurionID;   // assuré par mw auth.js
    
    let index = req.app.locals.listOfUsersCurrentlyGettingPlanningForFirstTime.indexOf(aurionID)
    if (index == -1) {
        console.log('NEXT FTFF');
        next();
    }
    else {
        return res.status(sCode.tooEarly).json({error: 'Veuillez attendre la réponse de la requête précendente.'})
    }
}
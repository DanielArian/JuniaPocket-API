const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../Config/index');
const sCode = require('../httpStatus');

const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');


exports.signup = async (req, res, next) => {

    let aurionID = req.body.aurionID;
    let aurionPassword = req.body.aurionPassword;
    let jpocketPassword = req.body.jpocketPassword;

    // console.log(aurionID, aurionPassword, jpocketPassword);

    // Verification des identifiants Aurion, et si valides, recuperation du nom de l'utilisateur
    let realName = '';
    try {
        let name = await aurionScrapper.fetch.checkAurionIDAndGetNameIfOk(aurionID, aurionPassword);
        if (name == 'INVALID') {
            return res.status(sCode.unauthorized).json({error: 'Login ou mot de passe Aurion invalide'});
        }
        else {
            realName = name;
        }
    } catch (error) {
        console.log(error);
        return res.status(sCode.serverError).json({ error });
    }

    // hashage du mdp JuniaPocket
    let jpPasswordHashed = '';
    try {
        jpPasswordHashed = await bcrypt.hash(jpocketPassword, 10)
    } catch (error) {
        console.log(error);
        return res.status(sCode.serverError).json({ error });
    }

    // Sauvegarde de l'utilisateur dans la Database
    // Et sauvegarde d'un doc de notification de préférence vide
    // dans la collection 'notificationPreferences'
    try {
        let userDoc = db.manageUser.createUserDocument(aurionID, aurionPassword, jpPasswordHashed, realName);
        db.save.saveDoc(userDoc);
        db.manageNotifPreferences.saveEmptyNotifPreferencesDoc(aurionID);
        return res.status(sCode.created).json({message: `Utilisateur créé`})
    } catch (error) {
        console.log(`signup error --> ${error}.`);
        return res.status(sCode.serverError).json({ error });
    }
}

exports.login = async (req, res, next) => {

    // On vérifie que l'utilisateur est bien inscrit
    // Si oui, on récupère ses infos
    var userDoc;
    try {
        let result = await db.search.findUserByAurionIDInCollection(req.body.aurionID, db.Models.User);
        if (result == 'USER_DOES_NOT_EXIST_IN_COLLECTION') {
            return res.status(sCode.unauthorized).json({error: 'Utilisateur non trouvé !'});
        }
        if (result == 'ERROR') {
            return res.status(sCode.serverError).json({error});
        }
        userDoc = result;
    } catch (error) {
        console.log(`login error --> ${error}`);
        return res.status(sCode.serverError).json({error});
    }
    // On compare le mdp envoyé avec celui hashé daans la bdd
    try {
        let result = await bcrypt.compare(req.body.jpocketPassword, userDoc.jpocketPassword);
        if (!result) {
            return res.status(sCode.unauthorized).json({ error: 'Mot de passe incorrect !' });
        }
        // Connexion réussie : on envoie un token JWT
        const payload = {
            aurionID: userDoc.aurionID
        };
        const secret = process.env.JWT_SECRET || config.JWTSecret;
        const options = {
            expiresIn: process.env.JWT_EXPIRATION_TIME || config.JWTExpirationTime
        };
        return res.status(sCode.OK).json({
            userID: userDoc._id,
            aurionID: userDoc.aurionID,
            token: jwt.sign(payload, secret, options)
          });
    } catch (error) {
        console.log(`login error --> ${error}`)
        return res.status(sCode.serverError).json({error});
    }
}
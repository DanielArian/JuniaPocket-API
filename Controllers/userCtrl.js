const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../Config/index');
const sCode = require('../httpStatus');

const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');
const planningCtrl = require('./planningCtrl');
const marksCtrl = require('./marksCtrl');


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
            return res.status(sCode.unauthorized).json({ error: 'Login ou mot de passe Aurion invalide' });
        }
        else {
            realName = name;
        }
    } catch (error) {
        console.log(error);
        return res.status(sCode.serverError).json({ error });
    }

    // hashage du mdp JuniaPocket
    let newJpocketHashedPass = '';
    try {
        newJpocketHashedPass = await bcrypt.hash(jpocketPassword, 10)
    } catch (error) {
        console.log(error);
        return res.status(sCode.serverError).json({ error });
    }

    // Sauvegarde de l'utilisateur dans la Database
    // Et sauvegarde d'un doc de notification de préférence vide
    // Et sauvegarde d'un doc de widget avec les préférences et valeurs par défaut
    // dans la collection 'notificationPreferences'
    try {
        let userDoc = db.manageUser.createUserDocument(aurionID, aurionPassword, newJpocketHashedPass, realName);
        await db.save.saveDoc(userDoc);
        db.manageNotifPreferences.saveEmptyNotifPreferencesDoc(aurionID);

        let initWidgetDoc = db.manageWidget.createWidgetDocument(aurionID);
        await db.save.saveDoc(initWidgetDoc);
        // return res.status(sCode.created).json({ message: `Utilisateur créé` })
    } catch (error) {
        console.log(`signup error --> ${error}.`);
        return res.status(sCode.serverError).json({ error });
    }

    // recup des notes et plannig pour la page d'accueil
    try {
        req.user = { aurionID: aurionID };
        await planningCtrl.getPlanningOfWeek(req, res);
        await marksCtrl.getMarks(req, res);
    } catch (error) {
        console.log(`signup error --> ${error}`);
        return res.status(sCode.serverError).json({ error });
    }

    return res.status(sCode.created).json({ message: `Utilisateur créé` })
}


exports.login = async (req, res, next) => {

    // On vérifie que l'utilisateur est bien inscrit
    // Si oui, on récupère ses infos
    var userDoc;
    try {
        let result = await db.search.findUserByAurionIDInCollection(req.body.aurionID, db.Models.User);
        if (result == 'USER_DOES_NOT_EXIST_IN_COLLECTION') {
            return res.status(sCode.unauthorized).json({ error: 'UTILISATEUR_NON_TROUVE' });
        }
        if (result == 'ERROR') {
            return res.status(sCode.serverError).json({ error });
        }
        userDoc = result;
    } catch (error) {
        console.log(`login error --> ${error}`);
        return res.status(sCode.serverError).json({ error });
    }
    // On compare le mdp envoyé avec celui hashé daans la bdd
    try {
        let result = await bcrypt.compare(req.body.jpocketPassword, userDoc.jpocketPassword);
        if (!result) {
            return res.status(sCode.unauthorized).json({ error: 'MOT_DE_PASSE_INCORRECT' });
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
        return res.status(sCode.serverError).json({ error });
    }
}


exports.getList = async function (req, res) {
    res.set('Content-Type', 'application/json');
    const list = await db.Models.User.find();
    let listid = list.map(x => [x.name, x.aurionID]);
    console.log(listid);
    res.status(sCode.OK).send(listid);
}


exports.changeJpocketPassword = async function (req, res) {

    if (!req.body.hasOwnProperty('jpocketPassword')) {
        return res.status(sCode.badRequest).json({ error: 'Bad Request : pas de nouveau mot de pase fourni.' })
    }

    let updatedJpocketPass = req.body.jpocketPassword;

    // hashage du mdp JuniaPocket
    // Puis update dans BDD
    let newJpocketHashedPass = '';
    try {
        newJpocketHashedPass = await bcrypt.hash(updatedJpocketPass, 10)
        await db.Models.User.updateOne({ aurionID: req.user.aurionID },
            { $set: { jpocketPassword: newJpocketHashedPass } }).then('Password updated!');
        return res.status(sCode.OK).json({ message: 'Mot de passe Junia Pocket mis à jour !' });
    } catch (error) {
        console.log(error);
        return res.status(sCode.serverError).json({ error });
    }
}


exports.changeAurionLoginCred = async function (req, res) {

    let oldAurionID = req.user.aurionID;            // assuré par auth.js

    let updatedAurionID = req.body.aurionID;        // assurés par requireUserNotAlreadyRegistered.js
    let updatedAurionPass = req.body.aurionPassword;

    // Verification des identifiants Aurion, et si valides, recuperation du nom de l'utilisateur
    let realName = '';
    try {
        let name = await aurionScrapper.fetch.checkAurionIDAndGetNameIfOk(updatedAurionID, updatedAurionPass);
        if (name == 'INVALID') {
            return res.status(sCode.unauthorized).json({ error: 'INVALID_AURION_LOGIN_CRED' });
        }
        else {
            realName = name;
        }
    } catch (error) {
        console.log(error);
        return res.status(sCode.serverError).json({ error });
    }

    // On vérifie que ce compte Aurion appartient bien à la même personne
    let userDoc = await db.search.findUserByAurionIDInCollection(oldAurionID, db.Models.User);
    if (userDoc.realName != realName) {
        return res.status(sCode.unauthorized).json({ error: 'NOT_YOUR_AURION_ACCOUNT' });
    }

    // Si c'est le compte Aurion de la même personne

    try {
        await db.Models.User.updateOne({ aurionID: oldAurionID },
            { $set: { aurionID: updatedAurionID, aurionPassword: updatedAurionPass } }).then('Cred updated!');
        return res.status(sCode.OK).json({ message: 'Identifiants mis à jour' });
    } catch (error) {
        console.log(`changeAurionLoginCred error --> ${error}`);
        return res.status(sCode.serverError).json({ error });
    }
}


exports.delete = async function (req, res) {

    let aurionID = req.user.aurionID;       // assuré par auth.js

    if (!req.body.hasOwnProperty('jpocketPassword')) {
        return res.status(sCode.badRequest).json({ message: 'Paramètre jpocketPassword manquant.' });
    }

    // On vérifie que l'utilisateur est bien inscrit
    // Si oui, on récupère son mpd hashé via son userDoc
    var userDoc;
    try {
        let result = await db.search.findUserByAurionIDInCollection(aurionID, db.Models.User);
        if (result == 'USER_DOES_NOT_EXIST_IN_COLLECTION') {
            return res.status(sCode.unauthorized).json({ error: 'UTILISATEUR_NON_TROUVE 22' });
        }
        if (result == 'ERROR') {
            return res.status(sCode.serverError).json({ error });
        }
        userDoc = result;
    } catch (error) {
        console.log(`login error --> ${error}`);
        return res.status(sCode.serverError).json({ error });
    }

    let result = await bcrypt.compare(req.body.jpocketPassword, userDoc.jpocketPassword);
    if (!result) {
        return res.status(sCode.unauthorized).json({ error: 'MOT_DE_PASSE_INCORRECT' });
    }

    await db.Models.User.deleteOne({ aurionID: aurionID }).then(console.log(`delete --> User Doc de ${aurionID} deleted!`));
    await db.Models.Planning.deleteOne({ aurionID: aurionID }).then(console.log(`delete --> Planning Doc de ${aurionID} deleted!`));
    await db.Models.Mark.deleteOne({ aurionID: aurionID }).then(console.log(`delete --> Mark Doc de ${aurionID} deleted!`));
    await db.Models.NotifPreferences.deleteMany({ aurionID: aurionID }).then(console.log(`delete --> Notification Preference Doc de ${aurionID} deleted!`));
    await db.Models.Widget.deleteMany({ aurionID: aurionID }).then(console.log(`delete --> Widget Doc de ${aurionID} deleted!`));
    await db.Models.Group.updateMany({ "list": { $in: [aurionID] } },
        {
            $pull: {
                list: { $in: [aurionID] }
            }
        }).then(console.log(`delete --> ${aurionID} retiré de tous ses éventuels groupes!`));
    return res.status(sCode.OK).json({ message: `Utilisateur ${aurionID} désinscrit avec succès!` });
}


exports.setNotificationsPreferences = async function (req, res) {
    let aurionID = req.user.aurionID;       // assuré par auth.js
    let PSID = req.body.messengerPSID;
    let mail = req.body.mail;
    if (db.manageNotifPreferences.setPreferences(aurionID, PSID, mail)) {
        return res.status(sCode.OK).json({ message: 'Preferences mises à jour !' })
    }
    return res.status(sCode.serverError).json({ error });
}
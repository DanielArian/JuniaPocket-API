const sCode = require('../httpStatus');
const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');
const notify = require('../notify');


exports.getMarks = async (req, res) => {

    // suite à l'authentification on récupère l'aurionID de l'utilisateur qui
    // a été récup dans le middleware auth
    let aurionID = req.user.aurionID;

    // On vérifie si l'user a déjà des notes existantes dans la database
    // Si oui, on renvoie ces notes et la requete s'arrete là.
    // Si non, on récupère ses notes sur Aurion, on les stocke dans notre BDD puis on renvoie les notes

    let marksData;
    try {
        marksData = await db.manageMark.getStudentMarks(aurionID);
    } catch (error) {
        console.log(`getMarks error --> ${error}`);
        return res.status(sCode.serverError).json({ error });
    }

    // Si l'utilisateur n'a pas pas encore de notes dans notre Database

    if (marksData.length == 0) {
        console.log(`getMarks --> Notes de ${aurionID} non existante dans la collection "marks".`);
        console.log(`Première récupération des notes de ${aurionID} sur Aurion. Connexion...`);

        // On récupère notes sur Aurion
        let updatedMarksOfUser;
        try {
            let aurionPassword = await db.manageUser.getAurionPassword(aurionID);
            if (aurionPassword == '') {
                console.log(`getMarks --> Erreur dans la lecture du mdp aurion dans la collection User`)
                return res.status(sCode.serverError).json({ error: '' });
            }
            let marksPageContent = await aurionScrapper.fetch.marks(aurionID, aurionPassword);
            if (marksPageContent == 'Username ou mot de passe invalide.') {
                return res.status(sCode.unauthorized).json({ error: 'Les identifiants aurion ne sont plus valides.' })
            }
            updatedMarksOfUser = aurionScrapper.formatMarks.getFormatedMarks(marksPageContent);
        } catch (error) {
            console.log(`getMarks error --> Echec de la récupération des notes Aurion de ${aurionID} -->  ${error}`)
            return res.status(sCode.serverError).json({ error });
        }

        // On les sauvegarde dans la Database pour les prochaines requetes
        try {
            let MarkDoc = db.manageMark.createMarkDocument(aurionID, updatedMarksOfUser);
            db.save.saveDoc(MarkDoc);
        } catch (error) {
            console.log(`getMarks error --> Echec sauvegarde des notes de ${aurionID} dans Marks --> ${error}`)
            return res.status(sCode.unauthorized).json({ error });
        }

        // On envoie les notes à l'utilisateur
        return res.status(sCode.OK).send(JSON.stringify(updatedMarksOfUser));
    }

    // Si une erreur s'est produite dans la lecture de la BDD

    if (marksData == 'ERROR') {
        return res.status(sCode.serverError).json({ error: 'Server Error' });
    }

    // Notes déjà existantes dans la Database, on les renvoie

    res.status(sCode.OK).send(JSON.stringify(marksData));
}


exports.updateMarks = async (req, res) => {
    /**
     * UNIQUEMENT POUR LES UTILISATEURS AYANT UN DOC DANS LA
     * COLLECTION 'marks' !
     */

    // suite à l'authentification on récupère l'aurionID de l'utilisateur qui
    // a été récup dans le middleware auth
    let aurionID = req.user.aurionID;

    console.log(`Mise à jour des notes de ${aurionID}. Connexion à Aurion...`);

    // On récupère notes sur Aurion
    let updatedMarksOfUser;
    try {
        let aurionPassword = await db.manageUser.getAurionPassword(aurionID);
        if (aurionPassword == '') {
            console.log(`getMarks --> Erreur dans la lecture du mdp aurion dans la collection User`)
            return res.status(sCode.serverError).json({ error });
        }
        let marksPageContent = await aurionScrapper.fetch.marks(aurionID, aurionPassword);
        if (marksPageContent == 'Username ou mot de passe invalide.') {
            return res.status(sCode.unauthorized).json({ error: 'Les identifiants aurion ne sont plus valides.' })
        }
        updatedMarksOfUser = aurionScrapper.formatMarks.getFormatedMarks(marksPageContent);
    } catch (error) {
        console.log(`getMarks error --> Echec de la récupération des notes Aurion de ${aurionID} -->  ${error}`)
        return res.status(sCode.serverError).json({ error });
    }

    // On vérifie s'il y a au moins une nouvelle note
    let oldMarksDoc = await db.search.findUserByAurionIDInCollection(aurionID, db.Models.Mark);
    let listOfNewMarks = db.manageMark.getListOfNewMarks(oldMarksDoc.marks, updatedMarksOfUser);
    let nbOfNewMarks = listOfNewMarks.length;

    // Envoi notification si au moins une nouvelle note et si update automatique
    if (nbOfNewMarks > 0 && req.body.hasOwnProperty('isAutomaticUpdate')) {
        // On génère le contenu de la notif
        let notifTitle = 'Nouvelle note !\n\n';
        if (nbOfNewMarks > 1) notifTitle = 'Nouvelles notes !\n';
        let notifContent = '';
        for (mark of listOfNewMarks) {
            let keys = Object.keys(mark);
            for (k of keys) {
                notifContent += k + ': ' + mark[k] + '\n'
            }
            notifContent += '\n';
        }
        // envoi
        notify(aurionID, notifTitle, notifContent);
    }

    // On met a jour la database
    // On pourrait sauter cette étape en utilisant la condition (nbOfNewMarks == 0)
    try {
        db.manageMark.updateMarksInDoc(aurionID, updatedMarksOfUser);
    } catch (error) {
        console.log(`getMarks error --> Echec sauvegarde des notes de ${aurionID} dans Marks --> ${error}`)
        return res.status(sCode.unauthorized).json({ error });
    }

    // On envoie les notes en guise de confirmation
    return res.status(sCode.OK).send(JSON.stringify(updatedMarksOfUser));
}
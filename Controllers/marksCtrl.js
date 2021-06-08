const config = require('../Config/index');
const sCode = require('../httpStatus');

const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');


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
        return res.status(sCode.serverError).json({error});
    }

    // Si l'utilisateur n'a pas pas encore de notes dans notre Database

    if (marksData.length == 0) {
        console.log(`getMarks --> Notes de ${aurionID} non existante dans la collection "marks".`);
        console.log(`Première récupération des notes de ${aurionID} sur Aurion. Connexion...`);
        
        // On récupère notes sur Aurion
        let marksOfUser;
        try {
            let aurionPassword = await db.manageUser.getAurionPassword(aurionID);
            if (aurionPassword == '') {
                console.log(`getMarks --> Erreur dans la lecture du mdp aurion dans la collection User`)
                return res.status(sCode.serverError).json({error});
            }
            let marksPageContent = await aurionScrapper.fetch.marks(aurionID, aurionPassword);
            marksOfUser = aurionScrapper.formatMarks.getFormatedMarks(marksPageContent);
        } catch (error) {
            console.log(`getMarks error --> Echec de la récupération des notes Aurion de ${aurionID} -->  ${error}`)
            return res.status(sCode.serverError).json({error});
        }

        // On les sauvegarde dans la Database pour les prochaines requetes
        try {
            let MarkDoc = db.manageMark.createMarkDocument(aurionID, marksOfUser);
            db.save.saveDoc(MarkDoc);
        } catch (error) {
            console.log(`getMarks error --> Echec sauvegarde des notes de ${aurionID} dans Marks --> ${error}`)
            return res.status(sCode.unauthorized).json({error});
        }

        // On envoie les notes à l'utilisateur
        return res.status(sCode.OK).send(JSON.stringify(marksOfUser));
    }

    // Si une erreur s'est produite dans la lecture de la BDD

    if (marksData == 'ERROR') {
        return res.status(sCode.serverError).json({error: 'Server Error'});
    }

    // Notes déjà existantes dans la Database, on les renvoie
    
    res.status(sCode.OK).send(JSON.stringify(marksData));
}


exports.updateMarks = async (req, res) => {
    /**
     * UNIQUEMENT POUR LES UTILISATEURS AYANT UN DOC DANS LA
     * COLLECTION 'marks' !
     * AJOUTER MIDDLEWARE POUR VERIFIER
     */

    // suite à l'authentification on récupère l'aurionID de l'utilisateur qui
    // a été récup dans le middleware auth
    let aurionID = req.user.aurionID;

    console.log(`Mise à jour des notes de ${aurionID}. Connexion à Aurion...`);
    
    // On récupère notes sur Aurion
    let marksOfUser;
    try {
        let aurionPassword = await db.manageUser.getAurionPassword(aurionID);
        if (aurionPassword == '') {
            console.log(`getMarks --> Erreur dans la lecture du mdp aurion dans la collection User`)
            return res.status(sCode.serverError).json({error});
        }
        let marksPageContent = await aurionScrapper.fetch.marks(aurionID, aurionPassword);
        marksOfUser = aurionScrapper.formatMarks.getFormatedMarks(marksPageContent);
    } catch (error) {
        console.log(`getMarks error --> Echec de la récupération des notes Aurion de ${aurionID} -->  ${error}`)
        return res.status(sCode.serverError).json({error});
    }

    // On met a jour la database
    try {
        db.manageMark.updateMarksInDoc(aurionID, marksOfUser);
    } catch (error) {
        console.log(`getMarks error --> Echec sauvegarde des notes de ${aurionID} dans Marks --> ${error}`)
        return res.status(sCode.unauthorized).json({error});
    }

    // On confirme l'update
    return res.status(sCode.OK).json({message: true})
}
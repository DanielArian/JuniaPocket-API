const sCode = require('../httpStatus');
const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');
const crypt = require('../crypt');


function renameProperty(obj, oldKey, newKey) {
    // Do nothing if the names are the same
    if (oldKey !== newKey) {
        Object.defineProperty(obj, newKey,
            Object.getOwnPropertyDescriptor(obj, oldKey));
        delete obj[oldKey];
    }
};


function renameLibellePropertyToEpreuve(apiResponse) {
    /**
     * A la demande du front. Ce n'est techniquement pas nécessaire.
     * Si la propriété "Libellé" n'existe pas, aucune modif n'est effectuée
     * 
     * @param {Array} apiRespnse - objet renvoyé par la fonction fomatMarks.getFormatedMarks d'aurionScrapper
     */

    // si le premier elem a cette prop, ils l'ont tous.
    if (apiResponse[0].hasOwnProperty('Libellé')) {
        for (markObj of apiResponse) {
            renameProperty(markObj, 'Libellé', '\u00C9preuve');
        }
    }
    return apiResponse;
}


function firstTimeDone(req, aurionID) {
    // On enleve l'aurionID de la liste des utilisateurs entrain de récupérer leur NOTES
    // Pour la première fois
    let index = req.app.locals.listOfUsersCurrentlyGettingMarkForFirstTime.indexOf(aurionID);
    if (index > -1) { // si c'est la première recup
        req.app.locals.listOfUsersCurrentlyGettingMarkForFirstTime.splice(index, 1);
    }
}


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

        // Si c'est la première fois que l'utilisateur récupère ses notes
        // On indique qu'une récupération est en cours pour empecher que cette meme requete
        // soit refaite avant la fin de celle-ci (via middleware isCurrentlyGettingMarkfFTFT.js).
        // Sinon l'user aura plusieurs marks Documents
        req.app.locals.listOfUsersCurrentlyGettingMarkForFirstTime.push(aurionID);


        console.log(`getMarks --> Notes de ${aurionID} non existante dans la collection "marks".`);
        console.log(`Première récupération des notes de ${aurionID} sur Aurion. Connexion...`);

        // On récupère notes sur Aurion
        let marksOfUser;
        try {
            let encodedAurionPassword = await db.manageUser.getAurionPassword(aurionID);
            let aurionPassword = crypt.decode(encodedAurionPassword);
            if (aurionPassword == '') {
                console.log(`getMarks --> Erreur dans la lecture du mdp aurion dans la collection User`)
                firstTimeDone(req, aurionID)
                return res.status(sCode.serverError).json({ error: '' });
            }
            let marksPageContent = await aurionScrapper.fetch.marks(aurionID, aurionPassword);
            if (marksPageContent == 'Username ou mot de passe invalide.') {
                firstTimeDone(req, aurionID)
                return res.status(sCode.unauthorized).json({ error: 'IDENTIFIANTS_AURION_MODIFIES' })
            }
            marksOfUser = aurionScrapper.formatMarks.getFormatedMarks(marksPageContent);
        } catch (error) {
            firstTimeDone(req, aurionID)
            console.log(`getMarks error --> Echec de la récupération des notes Aurion de ${aurionID} -->  ${error}`)
            return res.status(sCode.serverError).json({ error });
        }

        // On les sauvegarde dans la Database pour les prochaines requetes
        try {
            let MarkDoc = db.manageMark.createMarkDocument(aurionID, marksOfUser);
            await db.save.saveDoc(MarkDoc);
        } catch (error) {
            console.log(`getMarks error --> Echec sauvegarde des notes de ${aurionID} dans Marks --> ${error}`)
            return res.status(sCode.unauthorized).json({ error });
        }

        // Première récup et sauvegarde finie
        firstTimeDone(req, aurionID)
        
        // On envoie les notes à l'utilisateur
        // Mais avant, à la demande du front, si existe, on renome la property 'Libellé' par 'Epreuve'
        // JUSTE lors de l'envoi, pas dans la databse
        let marksCopy = JSON.parse(JSON.stringify(marksOfUser)); // copie
        renameLibellePropertyToEpreuve(marksCopy, 'Libellé', 'Épreuve');
        return res.status(sCode.OK).send(JSON.stringify(marksCopy));
    }

    // Si une erreur s'est produite dans la lecture de la BDD

    if (marksData == 'ERROR') {
        return res.status(sCode.serverError).json({ error: 'Server Error' });
    }

    // Notes déjà existantes dans la Database, on les renvoie
    // Mais avant, à la demande du front, si existe, on renome la property 'Libellé' par 'Epreuve'
    // JUSTE lors de l'envoi, pas dans la databse

    let marksCopy = JSON.parse(JSON.stringify(marksData));           // copie
    renameLibellePropertyToEpreuve(marksCopy, 'Libellé', 'Épreuve');
    return res.status(sCode.OK).send(JSON.stringify(marksCopy));
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
        let encodedAurionPassword = await db.manageUser.getAurionPassword(aurionID);
        let aurionPassword = crypt.decode(encodedAurionPassword);
        if (aurionPassword == '') {
            console.log(`getMarks --> Erreur dans la lecture du mdp aurion dans la collection User`)
            return res.status(sCode.serverError).json({ error });
        }
        let marksPageContent = await aurionScrapper.fetch.marks(aurionID, aurionPassword);
        if (marksPageContent == 'Username ou mot de passe invalide.') {
            return res.status(sCode.unauthorized).json({ error: 'IDENTIFIANTS_AURION_MODIFIES' });
        }
        updatedMarksOfUser = aurionScrapper.formatMarks.getFormatedMarks(marksPageContent);
    } catch (error) {
        console.log(`getMarks error --> Echec de la récupération des notes Aurion de ${aurionID} -->  ${error}`)
        return res.status(sCode.serverError).json({ error });
    }

    // On met a jour la database
    // On pourrait sauter cette étape en utilisant la condition (nbOfNewMarks == 0)
    // mais l'heure d'update ne serait pas mise à jour
    try {
        db.manageMark.updateMarksInDoc(aurionID, updatedMarksOfUser);
    } catch (error) {
        console.log(`getMarks error --> Echec sauvegarde des notes de ${aurionID} dans Marks --> ${error}`)
        return res.status(sCode.unauthorized).json({ error });
    }

    // On envoie les notes en guise de confirmation
    return res.status(sCode.OK).send(JSON.stringify(updatedMarksOfUser));
}
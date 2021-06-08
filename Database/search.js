const mongoose = require('mongoose');

exports.findUserByAurionIDInCollection = async (userAurionID, collectionModelObject) => {
    /**
     * Recherche un utilisateur dans la collection 'users'
     * Retourne :
     *   - le document de l'utilisateur si trouvé
     *   - 'USER_DOES_NOT_EXIST_IN_COLLECTION'
     *   - 'ERROR' si erreur interne
     */

    try {
        let data = await collectionModelObject.findOne({aurionID: userAurionID});
        if(!data) {
            // No data found (car !data = true si data = null )
            console.log(`findUserByAurionIDInCollection --> Utilisateur ${userAurionID} non trouvé dans la collection.`);
            return 'USER_DOES_NOT_EXIST_IN_COLLECTION';
        }
        console.log(`findUserByAurionIDInCollection --> Document ${data.constructor.modelName} de ${userAurionID} trouvé.`);
        return data;
    } catch (error) {
        console.log(`findUserByAurionIDInCollection error --> ${error}`);
        return 'ERROR';
    }
}
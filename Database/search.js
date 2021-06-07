const mongoose = require('mongoose');

exports.findUserByAurionIDInCollection = async (userAurionID, collectionModel) => {
    /**
     * Recherche un utilisateur dans la collection 'users'
     * Retourne :
     *   - le document de l'utilisateur si trouvé
     *   - 'USER_DOES_NOT_EXIST_IN_COLLECTION'
     *   - 'ERROR' si erreur interne
     */

    try {
        let data = await collectionModel.findOne({aurionID: userAurionID});
        console.log(`Document ${data.constructor.modelName} de ${userAurionID} trouvé.`);
        if(!data) {
            // No data found (car !data = true si data = null )
            console.log(`findUserByAurionIDInCollection --> Utilisateur ${userAurionID} non trouvé dans la collection  ${data.constructor.modelName}s.`);
            return 'USER_DOES_NOT_EXIST_IN_COLLECTION';
        }
        return data;
    } catch (error) {
        console.log(`findUserByAurionIDInCollection error --> ${error}`);
        return 'ERROR';
    }
}
const fetch = require('../AurionScrapperCore/fetch');
const manageUser = require('../Database/manageUser');
const bcrypt = require('bcrypt');

// MIDDLEWARE PENSER A REQUIRE LES PARAM POUR SIGN UP ET LOGIN

exports.signup = async (req, res, next) => {

    let aurionID = req.body.username;
    let aurionPassword = req.body.aurionPassword;
    let jpPassword = req.body.jpocketPassword;

    console.log(aurionID, aurionPassword, jpPassword)
    // Verification des identifiants Aurion
    let studentName = '';
    try {
        let name = await fetch.checkAurionIDAndGetNameIfOk(aurionID, aurionPassword);
        if (name == 'INVALID') {
            return res.status(401).json({error: 'Login ou mot de passe Aurion invalide'});
        }
        else {
            studentName = name;
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error });
    }
    // hashage du mdp JuniaPocket
    let jpPasswordHashed = '';
    try {
        jpPasswordHashed = await bcrypt.hash(jpPassword, 10)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
    // Sauvegarde de l'utilisateur dans la Database
    try {
        let userDoc = manageUser.createUserDocument(aurionID, jpPasswordHashed, studentName);
        manageUser.saveUser(userDoc);
        return res.status(201).json({message: `Utilisateur créé`})
    } catch (error) {
        console.log(`Une erreur s'est produite à l'enregistrement.`);
        console.log(error);
        return res.status(500).json({ error });
    }
};


exports.login = async (req, res, next) => {

};
const mongoose = require('mongoose');
const db = require('../Database/index');
const sCode = require('../httpStatus');

exports.createGroup = async function (req, res) {

    console.log(req.body);
    res.set('Content-Type', 'application/json');

    const doc = new db.Models.Group({
        _id: new mongoose.Types.ObjectId(),
        groupName: req.body.groupName,
        list: req.body.list,
    },
        { collection: 'group' });

    try {
        db.save.saveDoc(doc)
    } catch (error) {
        console.log(`createGroup error --> ${error}`);
        res.status(sCode.serverError).json({error});
    }
    res.status(sCode.created).json({message: 'Groupe créé !'})
}


exports.getUserGroups = async function (req, res) {

    let aurionID = req.user.aurionID;       // assuré par auth.js

    res.set('Content-Type', 'application/json');
    try {
        var liste = await db.Models.Group.find();
    } catch (error) {
        console.log(`getUserGroups error --> ${error}`);
        return res.status(sCode.serverError).json({ error });
    }
    var clearList = liste.filter(item => item.list.includes(aurionID));
    console.log(clearList);
    return res.status(sCode.OK).send(clearList);
}


exports.joinGroup = async function (req, res) {


    if (!req.body.hasOwnProperty('aurionIDToAdd') || !req.body.hasOwnProperty('groupID')) {
        return res.status(sCode.badRequest).json({error: 'Au moins un paramètre manquant.'})
    }

    let aurionIDToAdd = req.body.aurionIDToAdd;
    let groupID = req.body.groupID;

    let groupDoc;
    try {
        groupDoc = await db.Models.Group.findOne({'_id': mongoose.Types.ObjectId(groupID)})
    } catch (error) {
        console.log(`joinGroup error --> ${error}`);
        return res.status(sCode.serverError).json({ error });
    }

    if (groupDoc.list.includes(aurionIDToAdd)) {
        return res.status(sCode.conflict).json({message: "UTILISATEUR_DEJA_INSCRIT_DANS_LE_GROUPE"});
    }


    try {
        await db.Models.Group.updateOne(
            { '_id': mongoose.Types.ObjectId(groupID) },
            { $push: { "list": aurionIDToAdd } });
        return res.status(200).json({message: 'Utilisateur ajouté avec succès'});
    } catch (error) {
        console.log(`joinGroup error --> ${error}`);
        return res.status(sCode.serverError).json({ error });
    }
}


exports.leaveGroup = async function (req, res) {

    let aurionID = req.user.aurionID;       // assuré par auth.js

    if (!req.body.hasOwnProperty('groupID')) {
        return res.status(sCode.badRequest).json({error: 'Au moins un paramètre manquant.'})
    }
    let groupID = req.body.groupID;

    res.set('Content-Type', 'application/json');
    try {
        await db.Models.Group.updateOne(
            { '_id': mongoose.Types.ObjectId(groupID) },
            { $pull: { "list": aurionID } });
        return res.status(200).json({message: 'Suppression ok'});
    } catch (error) {
        console.log(`leaveGroup error --> ${error}`);
        return res.status(sCode.serverError).json({ error });
    }
}
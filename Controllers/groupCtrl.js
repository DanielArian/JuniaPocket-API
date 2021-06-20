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
    }
    res.status(sCode.created).json({message: 'Group créé !'})
}


exports.getUserGroups = async function (req, res) {

    let aurionID = req.user.aurionID;       // assuré par auth.js

    res.set('Content-Type', 'application/json');
    try {
        var liste = await db.Models.Group.find();
    } catch (error) {
        console.log(`/leave-group error --> ${error}`);
        return res.status(sCode.serverError).json({ error: 'SERVER_ERROR' });
    }
    var clearList = liste.filter(item => item.list.includes(aurionID));
    console.log(clearList);
    return res.status(sCode.OK).send(clearList);
}


exports.joinGroup = async function (req, res) {

    
}



exports.leaveGroup = async function (req, res) {

    let aurionID = req.user.aurionID;       // assuré par auth.js

    res.set('Content-Type', 'application/json');
    try {
        await db.Models.Group.updateOne(
            { '_id': mongoose.Types.ObjectId(req.body.groupId) },
            { $pull: { "list": aurionID } });
        return res.status(200).json({message: 'Suppression ok'});
    } catch (error) {
        console.log(`/leave-group error --> ${error}`);
        return res.status(sCode.serverError).json({ error: 'SERVER_ERROR' });
    }
}
const db = require('../Database/index');
const sCode = require('../httpStatus');
const mongoose = require('mongoose');

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

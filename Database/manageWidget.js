const mongoose = require('mongoose');
const db = require('./index');


function initPreference(widgetList) {
    let widgetPreference = {};
    widgetList.forEach(function (element) {
        widgetPreference[element] = { "size": 1, "isThere": true };
    })
    return widgetPreference;
}


function initHabits(widgetList) {
    let habits = []
    let habitsWidgetByHour = {}
    let number = 0

    for (let i = 0; i < 24; i++) {
        widgetList.forEach(function (element) {
            switch (element) {
                case 'classroom':
                    (i < 6 || i > 19) ? number = 30 : number = 70
                    break;
                case 'planning':
                    (i < 6 || i > 19) ? number = 100 : number = 100
                    break;
                case 'profil':
                    (i < 6 || i > 19) ? number = 0 : number = 0
                    break;
                case 'marks':
                    (i < 6 || i > 19) ? number = 70 : number = 50
                    break;
                case 'groupManagement':
                    (i < 6 || i > 19) ? number = 50 : number = 30
                    break;
                default:
                    break;
            }
            habitsWidgetByHour[element] = number;
        })
        habits[i] = habitsWidgetByHour;
        habitsWidgetByHour = {};
    }
    return habits;
}

exports.createWidgetDocument = function (userAurionID) {

    const widgetList = ["classroom", "planning", "profil", "marks", "groupManagement"];
    const widgetPreference = initPreference(widgetList);
    const habits = initHabits(widgetList);

    const doc = new db.Models.Widget({
        _id: new mongoose.Types.ObjectId(),
        aurionID: userAurionID,
        widgetPreference: widgetPreference,
        habits: habits
    },
        { collection: 'widget' });
    return doc;
}


exports.saveWidget = function (doc) {
    doc.save((err, insertedDoc) => {
        if (err) {
            console.error(err, insertedDoc);
            return false;
        }
        // This will print inserted record from database
        console.log(`saveWidget --> Sauvegarde d'un document Widget pour ${insertedDoc.aurionID} dans la collection "widget".`);
        return true;
    });
}


function findFalseWidget(preferenceArray) {
    const printableArrayWidget = []
    for (let i in preferenceArray) {
        preferenceArray[i].isThere == false ? printableArrayWidget.push(i) : null
    }
    return printableArrayWidget;
}

async function getFalseWidgetDoc(studentAurionID) {
    return new Promise((resolve, reject) => {
        try {
            const doc = db.Models.Widget.findOne({ aurionID: studentAurionID });
            if (doc == null) {
                console.log(`L\'étudiant ${aurionID} n'est PAS présent dans la collection "marks".`)
            }
            console.log(`Liste des widgets de l'étudiant ${studentAurionID} récupéré dans la collection "widgets".`)
            resolve(doc);

        }
        catch (error) {
            console.log(`getWidgetDoc error --> ${error}`);
            reject('ERROR');
        }
    });
}

exports.getFalseWidget = async function (studentAurionID) {
    try {
        let doc = await getFalseWidgetDoc(studentAurionID);
        if (doc == null) return [];
        if (doc == 'ERROR') return 'ERROR';
        else return findFalseWidget(doc.widgetPreference);
    } catch (error) {
        console.log(`getWidget error --> ${error}`);
        return 'ERROR';
    }
}
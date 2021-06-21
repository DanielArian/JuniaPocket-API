const db = require('../Database/index');
const sCode = require('../httpStatus');

function getOrderWidget(preferenceArray, habitsArray) {

    // Extraction des habitudes de l'utilsateur + trie 
    const sortableArrayHabits = Object.entries(habitsArray).sort(([, a], [, b]) => b - a);
    const printableArrayWidget = []
    // On garde uniquement le nom du wiget à print
    for (let i in sortableArrayHabits) {
        printableArrayWidget.push(sortableArrayHabits[i][0]);
    }
    for (element in preferenceArray) {
        item = preferenceArray[element]
        // On supprime les widgets ne devant pas apparaitre
        item.isThere == false ? printableArrayWidget.splice(printableArrayWidget.indexOf(element), 1) : null
        // On ajoute à la liste des widgets leur taille
        item.isThere == true ? printableArrayWidget[printableArrayWidget.indexOf(element)] = [printableArrayWidget[printableArrayWidget.indexOf(element)], item.size] : null
    }

    return printableArrayWidget;
}

async function getWidgetDoc(studentAurionID) {

    return new Promise((resolve, reject) => {
        try {
            console.log('mod', db.Models.Widget);
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

exports.getWidget = async (req, res) => {

    let studentAurionID = req.user.aurionID;

    let PrintableList;
    try {
        let doc = await getWidgetDoc(studentAurionID);
        if (doc == null) {
            return res.status(sCode.notFound).json({ error: `L'utilisateur n'as pas de widget document.` })
        };
        if (doc == 'ERROR') {
            return res.status(sCode.serverError).json({ error: 'SERVER_ERROR' });
        }
        PrintableList = getOrderWidget(doc.widgetPreference, doc.habits[new Date().getHours()]);
        return res.status(sCode.OK).send(JSON.stringify(PrintableList));

    } catch (error) {
        console.log(`getWidget error --> ${error}`);
        return res.status(sCode.serverError).json({ error: 'SERVER_ERROR' });
    }
}


exports.setPreferenceSizeWidget = async function (req, res) {

    if (!req.body.hasOwnProperty('widgetName') ||
        !req.body.hasOwnProperty('widgetSize')) {
        return res.status(sCode.badRequest).json({error: 'Au moins un paramètre manquant.'})
    }
    
    let aurionID = req.user.aurionID;
    let widgetName = req.body.widgetName;       // a verif dans MIDDLEWARE
    let widgetSize = req.body.widgetSize              // a verif dans MIDDLEWARE

    var pushObj = {};
    pushObj[`widgetPreference.${widgetName}.size`] = Number(widgetSize);
    console.log('pushObj:', pushObj)
    await db.Models.Widget.updateOne({ aurionID: aurionID },
        {
            $set: pushObj
        },
        function (err, doc) {
            console.log(doc)
        })

        .then(console.log('updated!'));
    res.status(sCode.OK).send('');
}


exports.setPreferenceIsThereWidget = async function (req, res) {

    if (!req.body.hasOwnProperty('widgetName') ||
        !req.body.hasOwnProperty('widgetIsThere')) {
        return res.status(sCode.badRequest).json({error: 'Au moins un paramètre manquant.'})
    }
    
    let aurionID = req.user.aurionID;
    let widgetName = req.body.widgetName;       // a verif dans MIDDLEWARE
    let widgetIsThere = req.body.widgetIsThere              // a verif dans MIDDLEWARE

    var pushObj = {};
    pushObj[`widgetPreference.${widgetName}.isThere`] = Boolean(widgetIsThere);
    console.log('pushObj:', pushObj)
    await db.Models.Widget.updateOne({ aurionID: aurionID },
        {
            $set: pushObj
        },
        function (err, doc) {
            console.log(doc)
        })

        .then(console.log('updated!'));
    res.status(sCode.OK).send('');
}


exports.setHabitsWidget = async function (req, res) {

    if (!req.body.hasOwnProperty('widgetName') ) {
        return res.status(sCode.badRequest).json({error: 'Au moins un paramètre manquant.'})
    }
    
    let aurionID = req.user.aurionID;
    let widgetName = req.body.widgetName;       // a verif dans MIDDLEWARE
    let hour = new Date().getHours()

    let doc = await db.Models.Widget.findOne({ aurionID: aurionID })
    const oldValueHabits = doc.habits[hour][widgetName]

    var pushObj = {};
    pushObj[`habits.${hour}.${widgetName}`] = oldValueHabits + 1;
    await db.Models.Widget.updateOne({ aurionID: aurionID },
        {
            $set: pushObj
        },
        function (err, doc) {
            console.log(doc)
        })

        .then(console.log('updated!'));
    res.status(sCode.OK).send('');
}


exports.getHiddenWidgets = async function (req, res) {

    let aurionID = req.user.aurionID;
    let array = await db.manageWidget.getFalseWidget(aurionID);
    if (array == 'ERROR') {
        return res.status(sCode.serverError).send('');
    }
    return res.status(sCode.OK).send(JSON.stringify(array));;
}
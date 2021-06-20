const sCode = require('../httpStatus');


function isNumeric(string) {
    return !isNaN(string);
}

function isDateFormatCorrect(date) {
    /**
     * @param {String} date 
     * @return {Bool} true if date format is 'dd/mm/yyyy' ou ''. False otherwise
     */

    // Si chaine non vide mais de longueur inférieure ou supérieurs au format de la date
    if (date.length != 0 & (date.length > 10 || date.length < 10)) {
        return false;
    }
    // Si chaine vide
    if (date.length == 0) {
        return true;
    }

    // Chaine de la bonne taille

    // On vérifie qu'il y a bien trois '/'
    let [day, month, year] = date.split('/');
    if (typeof(day) == 'undefined' ||
        typeof(month) == 'undefined' ||
        typeof(year) == 'undefined') {
            return false;
        }
    // On vérifie que le contenu est bien constitué de nombres
    // de la bonne taille
    if (day.length == 2 &
        month.length == 2 &
        year.length == 4 &
        isNumeric(day) &
        isNumeric(month) &
        isNumeric(year)) {

        // On vérifie que la date existe (par ex si on a 33/05/2021)
        let d = new Date(`${year}-${month}-${day}`);
        if (d.toString() == 'Invalid Date') return false;
        return true;
    }
    return false;
}


exports.requireAvailableRoomReqParam = async (req, res, next) => {

    if (req.body.hasOwnProperty('date') &
        req.body.hasOwnProperty('beginTime') &
        req.body.hasOwnProperty('timeToSpendInRoom')
        ) {
        if (isDateFormatCorrect(req.body.date)) next();
    }
    else {
        console.log('requireAvailableRoomReqParam --> Paramètre(s) manquant(s)');
        res.status(sCode.badRequest).json({error: 'Bad Request : il manque au moins un paramètre.'});
    }
}
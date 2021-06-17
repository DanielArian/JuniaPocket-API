// Index of all middlewares of the folder
// WARNING, middleware filename and middleware function in the file must be the same

const midlw = (middlewareFilename, req, res, next) => {
    /**
     * Comment on passe par un index, on ne pas exporter simplement les middleware
     * comme on aurait pu le faire avec un seul fichier.
     * Il faut retourner ce format d'exportation
     */
    const middleware = require('./' + middlewareFilename);
    return middleware[middlewareFilename](req, res, next);
}

exports.logRequest = (req, res, next) => {
    return midlw('logRequest', req, res, next);
}

exports.requireSignupParam = (req, res, next) => {
    return midlw('requireSignupParam', req, res, next);
}

exports.requireLoginParam = (req, res, next) => {
    return midlw('requireLoginParam', req, res, next);
}

exports.auth = (req, res, next) => {
    return midlw('auth', req, res, next);
}

exports.requireExistingMarkDoc = (req, res, next) => {
    return midlw('requireExistingMarkDoc', req, res, next);
}

exports.requireWeekDate = (req, res, next) => {
    return midlw('requireWeekDate', req, res, next);
}

exports.requireUserNotAlreadyRegistered = (req, res, next) => {
    return midlw('requireUserNotAlreadyRegistered', req, res, next);
}

exports.requireNotifPrefParam = (req, res, next) => {
    return midlw('requireNotifPrefParam', req, res, next);
}

exports.isCurrentlyGettingPlanninfFTFT = (req, res, next) => {
    return midlw('isCurrentlyGettingPlanninfFTFT', req, res, next);
}
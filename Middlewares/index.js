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

exports.requireBodyParam = (req, res, next) => {
    return midlw('requireBodyParam', req, res, next);
}

exports.auth = (req, res, next) => {
    return midlw('auth', req, res, next);
}
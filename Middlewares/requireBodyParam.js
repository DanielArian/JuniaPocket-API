/**
 * description
 */

module.exports.requireBodyParam = (req, res, next) => {
    if (req.body.hasOwnProperty('username') & req.body.hasOwnProperty('password')) {
        next();
    }
    else {
        console.log('Paramètres manquants');
        res.end('PARAM MANQUANTS');
    }
}
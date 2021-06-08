exports.logRequest = (req, res, next) => {
    console.log('------ Inside Middleware: logRequest ');
    
    console.log(req.method, req.path);
    console.log("Req BODY: ", req.body);
    next();
}
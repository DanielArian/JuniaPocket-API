const mongoose = require('mongoose');

exports.connectToMongoDB = (uri) => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB.'));
    db.once('open', function () {
        console.log("Connecté à Mongoose.");
    }
    );
}

exports.close = () => {
    mongoose.connection.close();
}
exports.saveDoc = async (doc) => {
    return doc.save((err, insertedDoc) => {
        if (err) {
            console.log(`saveDoc --> Echec: aucun ${doc.constructor.modelName} document pour ${doc.aurionID} sauvegardé.`);
            console.error(err, insertedDoc);
        }
        // This will print inserted record from database
        if (typeof(doc.aurionID) == 'undefined') {
            console.log(`saveDoc --> Succès: ${doc.constructor.modelName} document sauvegardé.`);
        }
        else {
            console.log(`saveDoc --> Succès: ${doc.constructor.modelName} document pour ${doc.aurionID} sauvegardé.`);
        }
        
        // console.log(insertedDoc)
      });
}
exports.saveDoc = (doc) => {
    doc.save((err, insertedDoc) => {
        if (err) {
            console.log(`saveDoc --> Echec: aucun ${doc.constructor.modelName} document pour ${doc.aurionID} sauvegardé.`);
            console.error(err, insertedDoc);
            return false;
        }
        // This will print inserted record from database
        console.log(`saveDoc --> Succès: ${doc.constructor.modelName} document pour ${doc.aurionID} sauvegardé.`);
        // console.log(insertedDoc)
        return true;
      });
}
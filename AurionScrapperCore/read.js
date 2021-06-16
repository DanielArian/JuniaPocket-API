// Requiring the module
const reader = require('xlsx')
// const json = require('./json_planning_p64002')
// const json = require('./json_planning_Lucile.wiech')
const json = require('./json_planning_h19190')
const db = require('../Database/index');

const config = require('../Config/index');
const dbUsername = config.dbUsername;
const dbPassword = config.dbPassword;

const mongoose = require('mongoose');
const dbConnection = require('../databaseConnection');
const URI = `mongodb+srv://daniel:mtafbww9c8mX3UdG@juniapocket.1vwtr.mongodb.net/data?retryWrites=true&w=majority`
dbConnection.connectToMongoDB(URI);

// Reading our test file
const file = reader.readFile('../salles.xlsx')

let data = []

const sheets = file.SheetNames

for (let i = 0; i < sheets.length; i++) {
  const temp = reader.utils.sheet_to_json(
    file.Sheets[file.SheetNames[i]])
  temp.forEach((res) => {

    data.push(res);
    // console.log(res)

    db.save.saveDoc(doc);

  })
}

// // Détecter une salle 
// for (k of Object.keys(json.days)) {

//   for (elem of json.days[k]) {

//     let room = elem.room;
//     for (l of data) {
//       if (room.includes(l.Label)) console.log(`${room} --> ${l.Label}`);
//     }
//   }
// }
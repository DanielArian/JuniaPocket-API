const axios = require('axios')
const db = require('./Database/index');
const { findOneAndUpdate } = require('./Database/Models/mark');

let PSID = 3969607053094746;
let message = "Salut Mec";

// axios
//   .post('https://notif-juniapocket.herokuapp.com/messenger', {
//     psid: 'PSID',
//     message: message
//   })
//   .then(res => {
//     console.log(`statusCode: ${res.statusCode}`)
//     console.log(res)
//   })
//   .catch(error => {
//     console.error(error)
//   })

module.exports = async (aurionID, notifTitle, content) => {
  /**
   * @param {String} aurionID 
   * @param {String} notifTitle 
   * @param {String} content
   * @return {Bool} 
   */
  let preferenceDoc = await db.search.findUserByAurionIDInCollection(aurionID, db.Models.NotifPreferences);

  if (preferenceDoc.mail != '') {
    axios
      .post('https://notif-juniapocket.herokuapp.com/email', {
        email: preferenceDoc.mail,
        object: notifTitle,
        content: content
      })
      .then(res => {
        console.log(`statusCode: ${res.statusCode}`);
        // console.log(res);
      })
      .catch(error => {
        console.error(error);
        return false;
      })
  }
  if (preferenceDoc.messengerPSID != '') {
    axios
      .post('https://notif-juniapocket.herokuapp.com/messenger', {
        psid: preferenceDoc.messengerPSID,
        message: notifTitle + '\n' + content
      })
      .then(res => {
        console.log(`statusCode: ${res.statusCode}`);
        // console.log(res);
      })
      .catch(error => {
        console.error(error);
        return false;
      })
  }
  return true;
}
const axios = require('axios')

let PSID  = 3969607053094746;
let message = "Salut Mec";

axios
  .post('https://notif-juniapocket.herokuapp.com/messenger', {
    psid: 'PSID',
    message: message
  })
  .then(res => {
    console.log(`statusCode: ${res.statusCode}`)
    console.log(res)
  })
  .catch(error => {
    console.error(error)
  })
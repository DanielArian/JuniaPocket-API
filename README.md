# aurion-scrapper-api
Projet en cours de développement.
Pour l'instant : récupération des notes et de son planning de la semaine au format JSON

*********

# Utilisation via POSTMAN

Configurer une requête POST, l'url de destination est :
* Pour récupérer les notes : `https://salty-everglades-02002.herokuapp.com/notes`
* Pour récupérer les planning : `https://salty-everglades-02002.herokuapp.com/planning`

Dans Body, cocher `x-www-form-urlencoded` puis remplir le tableau avec les key "username", "password" et "planningDate".
La valeur de la key planningDate n'est lue que si l'on souhaite récupérer les planning. Si on laisse le champs vide, on récupère
le planning de la semaine actuelle. Sinon, on peut préciser une date mais elle doit obligatoirement être au format
jj/mm/aaaa et on récupère dans ce cas le planning de la semaine de cette date.


# Utilisation via NodeJs

Dépendances :

* Environnement NodeJs
* Le module Axios (installation via `npm install axios`)

*********

Créer dans un même dossier les fichiers `login_data.json`, `config.json` et `client.js`. 

Le fichier `login_data.json` contient :

```json
{
    "username": "ecrireIciVotreIdentifiant",
    "password": "ecrireIciVotreMotDePasse"
}
```

Le fichier `config.json` contient :

```json
{
    "server": "",
    "requestedData": "planning",
    "planningDate": ""
}
```

Comment changer la configuration :

* `server` : laisser vide pour utiliser le serveur web ou bien écrire "local" pour utiliser le serveur localement.
* `requestedData` : "notes" ou "planning"
* `planningDate` : n'est lu que si l'on souhaite récupérer les planning. Si on laisse la valeur vide, on récupère
le planning de la semaine actuelle. Sinon, on peut préciser une date mais elle doit obligatoirement être au format
jj/mm/aaaa et on récupère dans ce cas le planning de la semaine de cette date.


Le fichier `client.js` contient :


```js

const login_data = require('./login_data.json');
const config = require('./config.json')
const axios = require('axios');
const fs = require('fs');

// Récupération de la configuration
requestedData = config.requestedData;
var dataToSend = {
    "username": login_data.username,
    "password": login_data.password,
    "planningDate": config.planningDate
};

var domain = "https://salty-everglades-02002.herokuapp.com"
if (config.server == "local") {
    domain = "http://localhost:5000";
}

const output_filename = 'APIresponse_' + requestedData + '_' + login_data.username +'.html';

// Envoi de la requête
axios.post( domain + "/" + requestedData, dataToSend)
    .then(function (response) {
        // Affiche la réponse
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      })

```

C'est le fichier client.js qui se charge d'envoyer la bonne requête au serveur, 
il affiche la réponse dans le terminal. Les éléments de réponses sont des listes
de dictionnaires qui pourront être directement réutilisées dans vos programmes.

Enfin, il ne reste plus qu'à lancer la commande `node client.js`
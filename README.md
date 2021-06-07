# aurion-scrapper-api
Projet en cours de développement.

## Pour vos tests

Interroger le serveur : https://juniapocketapi.herokuapp.com

### Signup

Envoyer ces infos en POST au chemin `/user/signup`

```json
{
  aurionID: <value>,
  aurionPassword: <value>,
  jpocketPassword: <value>
}
```

Il faut s'attendre aux réponses : 

Une erreur interne de serveur, repérable par le status code 500 de la réponse, qui contiendra en données :

```json
{
  error:
}
```

Status Code : 401

```json
{
  error: 'Login ou mot de passe Aurion invalide'
}```

Status Code : 201

```json
{
  message: `Utilisateur créé`
}
```


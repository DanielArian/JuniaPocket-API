# Junia Pocket API
Projet en cours de développement.

## Documentation

1. [Gestion des utilisateurs](#utilisateurs)
	  1. [Inscription](#inscription)
	  2. [Login](#login)
    3. [Changer ses identifiants Aurion](#changerIdentifiantsAurion)
    4. [Changer son mot de passe Junia Pocket](#change-jp-password)
    5. [Supprimer son compte Junia Pocket](#supprimer-compte)
2. [Notes](#notes)
    1. [Récupération des notes](#recup-notes)
    2. [Vérifier si de nouvelles notes ont été ajoutées](#fetch-notes)
3. [Planning](#planning)
    1. [Récupération des Planning](#recup-planning)
    2. [Vérifier s'il y a des modifications dans un planning](#fetch-planning)
4. [Notifications](#notifications)

Interroger le serveur : https://juniapocketapi.herokuapp.com

##  Gestion des utilisateurs <a name="utilisateurs"></a>

## Inscription <a name="inscription"></a>

Enregistrement de l'utilisateur sur JuniaPocjet.

### Requête à effectuer 

Methode : `POST`

Route : `/user/signup`

Data : 
```js
{
  aurionID: <votre_identifiant_sur_Aurion>,
  aurionPassword: <votre_mdp_sur_Aurion>;
  jpocketPassword: <choisir_un_mdp_pour_se_connecter_a_JuniaPocket>
}
```

### Réponses possibles

Status Code : `201` (Created) / Si Inscription réussie, user enregistré dans la collection 'users' dans la database.

Status Code : `401` (Unauthorized) / Si l'identifiant ou le mot de passe Aurion fournis sont incorrects, il est impossible de créer un compte.

Status Code : `500` (Server Error) / Il y a une erreur interne.

## Login <a name="login"></a>

### Requête à effectuer 

Methode : `POST`

Route : `/user/login`

Data : 
```js
{
  aurionID: <votre_identifiant_sur_Aurion>,
  jpocketPassword: <votre_mdp_JuniaPocket>
}
```

### Réponses possibles

Status Code : `201` (Created) / Connexion réussie. Le serveur renvoie ces infos à récupérer :

```js
{
  user._id: <value>,
  aurionID: <value>;
  token: <value>
}
```

Ce token JWT vous permettra de vous authenfier pour les réquêtes nécessitant un droit d'accès.

Status Code : `401` (Unauthorized) / Utilisateur non trouvé ou mot de passe JuniaPocket incorrect.

Status Code : `500` (Server Error) / Il y a une erreur interne.

Et d'autres erreur diverses ...


## Mettre à jour ses identifiants Aurion <a name="changerIdentifiantsAurion"></a>

### Requête à effectuer 

Requête `POST` à l'url :  `/user/change-aurion-login-credentials`

Le body de la requête doit contenir :

```js
{
  aurionID: <updated__value>
  aurionPassword: <updated_value>
}
```

### Réponses possibles (non exhaustif)

Status code : `200 (OK)` 

Status code :`401 (Unauthorized)`  et en body `{error: 'INVALID_AURION_LOGIN_CRED' }`

Status code :`401 (Unauthorized)`  et en body `{error: 'NOT_YOUR_AURION_ACCOUNT' }`

Bad Request, Server Error, etc...


## Changer son mot de passe Junia Pocket <a name="change-jp-password"></a>

### Requête à effectuer 

Requête `POST` à l'url :  `/user/change-jpocket-password`

Le body de la requête doit contenir :

```js
{
  jpocketPassword: <new_value>
}
```

### Réponses possibles (non exhaustif)

Status code : `200 (OK)` 

Status code :`401 (Unauthorized)`

Bad Request, Server Error, etc...

## Supprimer son compte Junia Pocket <a name="supprimer-compte"></a>

Requête `GET` à l'url :  `/user/delete`

## Notes <a name="notes"></a>

## Récupération des notes <a name="recup-notes"></a>

Pour un utilisateur authentifié (via token), on lit dans la BDD les notes
qui sont enregistrées dans son document de la collection 'marks' puis on
les renvoie au client.

Si c'est la première fois que l'utilisateur utilise cette requête,
le serveur récupère les notes de l'utilisateur sur Aurion et les sauvegarde
dans la BDD pour les prochaines fois.

### Requête à effectuer 

Methode : `POST`

Route : `/marks/get`

A ajouter dans le Header : `Authorization: Bearer <token_obtenu_au_login>`

Data : rien à envoyer

### Réponse attendue

Status Code : `200` (OK) 

Data : un Array contenant des Objets regroupant toutes les infos des notes disponibles
dans la BDD (ou sur le compte aurion de l'utilisateur si c'est la 1ere fois que cette
requête est effectuée). Les clés des objects peuvent varier entre les utilisateurs.

Pour récupérer la liste des clés : `Object.keys(responseData)`


## Vérifier si de nouvelles notes ont été ajoutées <a name="fetch-notes"></a>

Cette requête n'est à effectuer QUE pour un utilisateur ayant déjà utilisée
la requête précedente. Elle permet de lancer une nouvelle récupération des notes
sur Aurion et mettre à jour les données de notes pour l'utilisateur dans la BDD.

### Requête à effectuer 

Methode : `POST`

Route : `/marks/update`

A ajouter dans le Header : `Authorization: Bearer <token_obtenu_au_login>`

Data : rien à envoyer

### Réponse attendue

Status Code : `200` (OK) 

Data : un Array contenant des Objets regroupant toutes les infos des notes disponibles
sur le compte aurion de l'utilisateur. Les clés peuvent varier selon les utilisateurs.

Pour récupérer la liste des clés : `Object.keys(responseData)`


## Planning <a name="planning"></a>

## Récupération Planning <a name="recup-planning"></a>

La récupération d'un planning se fait semaine par semaine.

Pour un utilisateur authentifié (via token), on lit dans la BDD les semaines
qui sont enregistrées dans son document de la collection 'plannings' puis on
renvoie la semaine demandée.

Si c'est la première fois que l'utilisateur utilise cette requête,
le serveur récupère la semaine demandée par l'utilisateur sur Aurion
et la sauvegarde dans la BDD pour les prochaines fois.

### Requête à effectuer 

Methode : `POST`

Route : `/planning/get-week`

A ajouter dans le Header : `Authorization: Bearer <token_obtenu_au_login>`

Data : 
```js
{
  date: <jj/mm/aaaa>,
  notification: <true_or_false>
}
```

La valeur de `date` doit obligatoirement être au format `jj/mm/aaaa` et le serveur
renvoie le planning de toute la semaine incluant cette date.

REMARQUE IMPORTANTE : Si la valeur de `date` est laissée vide (une chaine vide), c'est
la semaine actuelle qui va être récupérée.

### Réponse attendue

A noter : La première fois que vous utilisez cette requête, si vous renvoyez la même requête avant que la première ne soit complétée, vous recevrez un status code `425` (Too Early) avec en message d'erreur.

A compteter



## Vérifier s'il y a des modifications dans un planning <a name="fetch-planning"></a>

### Requête à effectuer 

Methode : `POST`

Route : `/planning/update`

A ajouter dans le Header : `Authorization: Bearer <token_obtenu_au_login>`

Data : 
```js
{
  date: <jj/mm/aaaa>,
}
```

La valeur de `date` doit obligatoirement être au format `jj/mm/aaaa`, le serveur
renvoie le planning de toute la semaine incluant cette date après avoir mis à jour
la Database.

REMARQUE IMPORTANTE : Si la valeur de `date` est laissée vide (une chaine vide), c'est
la semaine actuelle qui va être récupérée.

### Réponse attendue

Même type de réponse que la requête précédente.

## Notifications <a name="notifications"></a>

A l'inscription d'un nouvel utilisateur, un document est initialisé dans la collection
'notification preferences'. Il contient les informations suivantes :

```js
{
  _id: <value>
  aurionID: <value>
  messengerPSID: '',
  mail: ''
}
```

A noter pour la suite que si un champs n'est pas laissé vide alors il sera utilisé.
Donc si l'utilisateur renseigne un mail et un psid, alors il recevra une notification
à la fois par mail et sur messenger. De la même façon, si ces champs sont laissés vides,
aucune notification sera envoyée à l'utilisateur.

Pour renseigner ces informations, utiliser la requête suivante.

### Requête à effectuer 

Methode : `POST`

Route : `/user/preferences/notifications`

A ajouter dans le Header : `Authorization: Bearer <token_obtenu_au_login>`

Data : 
```js
{
  messengerPSID: <value>,
  mail: <value>
}
```

La valeur de `messengerPSID` s'obtient en envoyant le message "Je voudrais mon code" au bot Facebook [JuniaPocket](https://www.facebook.com/JuniaPocket).

### Réponse attendue

Status Code : `200` (OK) et en réponse : `{message: 'Preferences mises à jour !'}`

Status Code : `400` (Bad Request)

Satus Code : `500` (Server Error)
# Junia Pocket API
Projet en cours de développement.

## Documentation

1. [Gestion des utilisateurs](#utilisateurs)
	1. [Inscription](#inscription)
	2. [Login](#login)
	
2. [Notes](#notes)
  1. [Récupération des notes](#recup-notes)
  2. [Vérifier si de nouvelles notes ont été ajoutées](#fetch-notes)

3. [Planning](#planning)
  1. [Récupération des Planning](#recup-planning)
  2. [Vérifier s'il y a des modifications dans un planning](#fetch-planning)

Interroger le serveur : https://juniapocketapi.herokuapp.com

##  Gestion des utilisateurs <a name="utilisateurs"></a>

## Inscription <a name="inscription"></a>

### Requête à effectuer 

Route : `/user/signup`

Data : 
```js
{
  aurionID: <votre_identifiant_sur_Aurion>,
  aurionPassword: <votre_mdp_sur_Aurion>;
  jpocket: <choisir_un_mdp_pour_se_connecter_a_JuniaPocket>
}
```

test



### Login <a name="login"></a>

## Notes <a name="notes"></a>

### Récupération des notes <a name="recup-notes"></a>

### Vérifier si de nouvelles notes ont été ajoutées <a name="fetch-notes"></a>

## Planning <a name="planning"></a>

### Récupération Planning <a name="recup-planning"></a>

### Vérifier s'il y a des modifications dans un planning <a name="fetch-planning"></a>
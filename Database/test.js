// DOCUMENT DE TESTS AVEC MONGO DB

const mongoose = require('mongoose');
const mongo = require('./manageMark');

const PlanningModel = require('./Models/planning');
const MarkModel = require('./Models/mark');

const uri = "mongodb+srv://daniel:daniel59@widget.1vwtr.mongodb.net/data?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connecté à Mongoose");
    launchMain()
});


function launchMain() {

    // // Find a Model in database
    // MarkModel.findOne({ 'aurionID': 'p64002' }, function (err, doc) {
    //     if (err) return handleError(err);
    //     console.log(doc.aurionID);
    // });

    var a = {
        "weekNumber": "20",
        "year": "2021",
        "beginDate": "Mon May 17 2021",
        "data": {
            "Mon, 17 May 2021 00:00:00 GMT": [
                {
                    "date": "Mon, 17 May 2021 00:00:00 GMT",
                    "room": " - ISEN B802     (H)",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "08:00",
                    "endTime": "12:00",
                    "teacher": " ",
                    "other": "",
                    "isAnExam": "non"
                },
                {
                    "date": "Mon, 17 May 2021 00:00:00 GMT",
                    "room": " - ISEN B801",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "13:30",
                    "endTime": "17:30",
                    "teacher": "Monsieur LEFETZ",
                    "other": "",
                    "isAnExam": "non"
                }
            ],
            "Tue, 18 May 2021 00:00:00 GMT": [
                {
                    "date": "Tue, 18 May 2021 00:00:00 GMT",
                    "room": " - ISEN B802     (H)",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "08:00",
                    "endTime": "12:00",
                    "teacher": "Monsieur LEFETZ",
                    "other": "",
                    "isAnExam": "non"
                },
                {
                    "date": "Tue, 18 May 2021 00:00:00 GMT",
                    "room": " - ISEN B801",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "13:30",
                    "endTime": "17:30",
                    "teacher": " ",
                    "other": "",
                    "isAnExam": "non"
                }
            ],
            "Wed, 19 May 2021 00:00:00 GMT": [
                {
                    "date": "Wed, 19 May 2021 00:00:00 GMT",
                    "room": " - ISEN B801",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "08:00",
                    "endTime": "12:00",
                    "teacher": " ",
                    "other": "",
                    "isAnExam": "non"
                },
                {
                    "date": "Wed, 19 May 2021 00:00:00 GMT",
                    "room": " - ISEN A816",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "13:30",
                    "endTime": "17:30",
                    "teacher": "Monsieur LEFETZ",
                    "other": "",
                    "isAnExam": "non"
                }
            ],
            "Thu, 20 May 2021 00:00:00 GMT": [
                {
                    "date": "Thu, 20 May 2021 00:00:00 GMT",
                    "room": " - ISEN B802     (H)",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "08:00",
                    "endTime": "12:00",
                    "teacher": "Monsieur LEFETZ",
                    "other": "",
                    "isAnExam": "non"
                },
                {
                    "date": "Thu, 20 May 2021 00:00:00 GMT",
                    "room": " - ISEN B802     (H)",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "13:30",
                    "endTime": "17:30",
                    "teacher": "Monsieur LEFETZ",
                    "other": "",
                    "isAnExam": "non"
                },
                {
                    "date": "Thu, 20 May 2021 00:00:00 GMT",
                    "room": "Présentation du Poster IB/Interculturel - Vauban CoWorking",
                    "eventName": "",
                    "startTime": "13:30",
                    "endTime": "15:30",
                    "teacher": "Madame GRUMETZ",
                    "other": "",
                    "isAnExam": "non"
                }
            ],
            "Fri, 21 May 2021 00:00:00 GMT": [
                {
                    "date": "Fri, 21 May 2021 00:00:00 GMT",
                    "room": " - ISEN B802     (H)",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "08:00",
                    "endTime": "12:00",
                    "teacher": "Monsieur LEFETZ",
                    "other": "",
                    "isAnExam": "non"
                },
                {
                    "date": "Fri, 21 May 2021 00:00:00 GMT",
                    "room": " - ISEN B801",
                    "eventName": "Projet Développement Logiciel",
                    "startTime": "13:30",
                    "endTime": "17:30",
                    "teacher": "Monsieur LEFETZ",
                    "other": "",
                    "isAnExam": "non"
                }
            ],
            "Sat, 22 May 2021 00:00:00 GMT": []
        }
    }
    
    // const pdoc = mongo.createPlanningDocument("p64002", a);
    // mongo.save(pdoc);



    var m = [
        {
            "Date": "05/05/2021",
            "Code": "2021_ISEN_CSI3_S2_INFO_TP_BDD_RESEAUX",
            "Libellé": "Travaux pratiques de Bases de Données/Réseaux ",
            "Note": "20.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "DELANNOY Dominique"
        },
        {
            "Date": "20/04/2021",
            "Code": "2021_ISEN_CSI3_S2_AUTOMATIQUE_DS",
            "Libellé": "Devoir Surveillé d'Automatique",
            "Note": "17.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "KRAIEM Youssef, TAGNE Gilles"
        },
        {
            "Date": "10/04/2021",
            "Code": "2021_ISEN_CSI3_S2_NANO_DS",
            "Libellé": "Devoir Surveillé de Physique du Solide et Nanosciences",
            "Note": "19.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "N'KONOU Kekeli, CROENNE Charles, WALLART Xavier, LEFEBVRE Isabelle, GRANDIDIER Bruno, DIENER Pascale"
        },
        {
            "Date": "01/04/2021",
            "Code": "2021_ISEN_CSI3_S2_ANSIGIM_DS",
            "Libellé": "Devoir Surveillé d'Analyse des Signaux et des Images",
            "Note": "20.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "KRZEMINSKI Christophe, PATE Arthur, BOULINGUEZ David"
        },
        {
            "Date": "30/03/2021",
            "Code": "2021_ISEN_CSI3_S2_SYSELEC_DS",
            "Libellé": "Devoir Surveillé de Systèmes Electroniques",
            "Note": "12.30",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "STEFANELLI Bruno, CAPRON Jean-Marc"
        },
        {
            "Date": "25/03/2021",
            "Code": "2021_ISEN_CSI3_S2_NANO_INT",
            "Libellé": "Interrogation de Physique Nanosciences",
            "Note": "15.40",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "DIENER Pascale, N'KONOU Kekeli, CROENNE Charles, WALLART Xavier, LEFEBVRE Isabelle, GRANDIDIER Bruno"
        },
        {
            "Date": "25/03/2021",
            "Code": "2021_ISEN_CSI3_S2_INFO_BDD_RESEAUX_DS",
            "Libellé": "Devoir Surveillé d'Informatique- Base de données et Réseaux",
            "Note": "16.10",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "DELANNOY Dominique"
        },
        {
            "Date": "18/03/2021",
            "Code": "2021_ISEN_CSI3_S2_SYSELEC_INT",
            "Libellé": "Interrogation de Systèmes Electroniques",
            "Note": "19.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "STEFANELLI Bruno"
        },
        {
            "Date": "08/01/2021",
            "Code": "2021_ISEN_CSI3_S1_PROJET_ESE_S1",
            "Libellé": "Evaluation du projet de Gestion d'Entreprise",
            "Note": "15.20",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "DEGROOTE Didier"
        },
        {
            "Date": "08/01/2021",
            "Code": "2021_ISEN_CSI3_S1_PROJET_COMM_S1",
            "Libellé": "Evaluation du projet de Communication",
            "Note": "17.60",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "CANONNE Bérangère, LUBET Marie-Pierre, DELEPLANQUE Charlotte"
        },
        {
            "Date": "07/01/2021",
            "Code": "2021_ISEN_CSI3_S1_ELEC_PROJET",
            "Libellé": "Projet de Janvier",
            "Note": "20.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "LARRAS Benoit, STEFANELLI Bruno"
        },
        {
            "Date": "17/12/2020",
            "Code": "2021_ISEN_CSI3_S1_INFO_ALGO_C_PARTIEL",
            "Libellé": "Partiel Algorithmie-Langage C",
            "Note": "20.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "MOSBAH Pascal, RICQ Pascal"
        },
        {
            "Date": "17/12/2020",
            "Code": "2021_ISEN_CSI3_S1_GESTION_PROJET",
            "Libellé": "Devoir Surveillé",
            "Note": "13.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "GRUMETZ Frédérique"
        },
        {
            "Date": "16/12/2020",
            "Code": "2021_ISEN_CSI3_S1_TRANS_PARTIEL",
            "Libellé": "Partiel Transformation",
            "Note": "19.62",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "DELEURENCE Amélie, CHENEVERT Gabriel"
        },
        {
            "Date": "16/12/2020",
            "Code": "2021_ISEN_CSI3_S1_MECAQ_PARTIEL",
            "Libellé": "Partiel Mécanique Quantique",
            "Note": "20.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "LEFEBVRE Isabelle, CROENNE Charles, ROBILLARD Jean-François, GRANDIDIER Bruno, DIENER Pascale, DEVOS Arnaud, WALLART Xavier"
        },
        {
            "Date": "15/12/2020",
            "Code": "2021_ISEN_CSI3_S1_ELEC_PARTIEL",
            "Libellé": "Epreuve de Partiel",
            "Note": "16.10",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "STEFANELLI Bruno, LARRAS Benoit"
        },
        {
            "Date": "15/12/2020",
            "Code": "2021_ISEN_CSI3_S1_ANGLAIS_EVAL",
            "Libellé": "Evaluation CSI3 Anglais S1",
            "Note": "19.35",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "LITTON Evelyne, DAWSON Matthew, COATES Antony"
        },
        {
            "Date": "14/12/2020",
            "Code": "2021_ISEN_CSI3_S1_ETHIQUE_EVAL",
            "Libellé": "Evaluations d'Ethique",
            "Note": "16.25",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "GRUMETZ Frédérique, DEFFONTAINE Yann, CROUZAT Charles"
        },
        {
            "Date": "14/12/2020",
            "Code": "2021_ISEN_CSI3_S1_ELEC_TP_MICROCONTROLEUR",
            "Libellé": "TP Microcontroleurs",
            "Note": "13.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "LARRAS Benoit"
        },
        {
            "Date": "07/12/2020",
            "Code": "2021_ISEN_CSI3_S1_ELEC_TP_FPGA",
            "Libellé": "TP FPGA",
            "Note": "16.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "CAPRON Jean-Marc, STEFANELLI Bruno, LARRAS Benoit, PHILIPPE Justine"
        },
        {
            "Date": "14/11/2020",
            "Code": "2021_ISEN_CSI3_S1_ELEC_DS",
            "Libellé": "Epreuve de Devoir Surveillé",
            "Note": "19.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "CAPRON Jean-Marc, STEFANELLI Bruno"
        },
        {
            "Date": "09/11/2020",
            "Code": "2021_ISEN_CSI3_S1_MECAQ_DS",
            "Libellé": "Devoir Surveillé Mécanique Quantique",
            "Note": "17.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "GRANDIDIER Bruno, DIENER Pascale, CROENNE Charles, WALLART Xavier, ROBILLARD Jean-François, LEFEBVRE Isabelle, DEVOS Arnaud"
        },
        {
            "Date": "20/10/2020",
            "Code": "2021_ISEN_CSI3_S1_INFO_ALGO_C_DS",
            "Libellé": "Devoir Surveillé Algorithmie-Langage C",
            "Note": "18.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "MOSBAH Pascal, RICQ Pascal"
        },
        {
            "Date": "12/10/2020",
            "Code": "2021_ISEN_CSI3_S1_APM_EVAL",
            "Libellé": "Evaluation Ateliers Préparatoires Mathématiques",
            "Note": "17.30",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "DELEURENCE Amélie, CHENEVERT Gabriel"
        },
        {
            "Date": "09/10/2020",
            "Code": "2021_ISEN_CSI3_S1_TRANS_TP",
            "Libellé": "Travaux Pratiques Transformation",
            "Note": "17.20",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "CHENEVERT Gabriel"
        },
        {
            "Date": "09/10/2020",
            "Code": "2021_ISEN_CSI3_S1_INFO_PROJET",
            "Libellé": "Projet Algorithmie Langage C",
            "Note": "18.35",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "DELANNOY Dominique"
        },
        {
            "Date": "05/10/2020",
            "Code": "2021_ISEN_CSI3_S1_INFO_TP_C",
            "Libellé": "Travaux Pratiques Algorithmie-Langage C",
            "Note": "17.80",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "RICQ Pascal, MOSBAH Pascal"
        },
        {
            "Date": "05/10/2020",
            "Code": "2021_ISEN_CSI3_S1_ELEC_INT",
            "Libellé": "Interrogation",
            "Note": "15.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "STEFANELLI Bruno, LOYEZ Christophe, CAPRON Jean-Marc, LARRAS Benoit"
        },
        {
            "Date": "07/03/2020",
            "Code": "1920_ISEN_CPG2_MATHS_DS5",
            "Libellé": "DS n°5",
            "Note": "14.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "08/02/2020",
            "Code": "1920_ISEN_CPG2_ANGLAIS_DS2",
            "Libellé": "DS n°2",
            "Note": "16.19",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "04/02/2020",
            "Code": "1920_ISEN_CPG2_SI_DS3",
            "Libellé": "DS n°3",
            "Note": "16.10",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "25/01/2020",
            "Code": "1920_ISEN_CPG2_PHYS_DS4",
            "Libellé": "DS n°4",
            "Note": "17.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/01/2020",
            "Code": "1920_ISEN_CPG2_SI_TP_S2",
            "Libellé": "TP S2",
            "Note": "18.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/01/2020",
            "Code": "1920_ISEN_CPG2_SI_COLLES_S2",
            "Libellé": "Colles S2",
            "Note": "19.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/01/2020",
            "Code": "1920_ISEN_CPG2_PROJET_INFO_S2",
            "Libellé": "Projet Informatique S2",
            "Note": "20.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "LEMAIRE Claude, BELLEUDY Emmanuel, DUMONT Pierre-Emmanuel"
        },
        {
            "Date": "01/01/2020",
            "Code": "1920_ISEN_CPG2_PROJET_FHS_PROD",
            "Libellé": "Production créative",
            "Note": "16.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "CHEVALIER Nicole"
        },
        {
            "Date": "01/01/2020",
            "Code": "1920_ISEN_CPG2_FHS_COMMUNICATION",
            "Libellé": "Communication",
            "Note": "20.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/01/2020",
            "Code": "1920_ISEN_CPG2_FHS_COLLES",
            "Libellé": "Colles lettres",
            "Note": "15.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/01/2020",
            "Code": "1920_ISEN_CPG2_BONIF_COVID",
            "Libellé": "Bonification Spécifique 2019-2020 après annulation des projets",
            "Note": "0.30",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "BELLEUDY Emmanuel, GRAVELINES Marie-Hélène"
        },
        {
            "Date": "01/01/2020",
            "Code": "1920_ISEN_CPG2_ANGLAIS_COLLES_S2",
            "Libellé": "Colles S2",
            "Note": "15.25",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "20/12/2019",
            "Code": "1920_ISEN_CPG2_PART1_SI",
            "Libellé": "Partiel 1 de SI",
            "Note": "16.80",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "RICQ Christian, MASQUELIER Pascal, DUMONT Pierre-Emmanuel"
        },
        {
            "Date": "19/12/2019",
            "Code": "1920_ISEN_CPG2_PART1_PHYS",
            "Libellé": "Partiel 1 de Physique",
            "Note": "16.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "HARBONNIER Antoine, GRAVELINES Marie-Hélène"
        },
        {
            "Date": "18/12/2019",
            "Code": "1920_ISEN_CPG2_PART1_MATHS_ECRIT",
            "Libellé": "Partiel 1 de Maths - Ecrit",
            "Note": "14.25",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "HOCHART Perrine, BELLEUDY Emmanuel"
        },
        {
            "Date": "18/12/2019",
            "Code": "1920_ISEN_CPG2_PART1_ANGLAIS_ORAL",
            "Libellé": "Partiel 1 d'Anglais - Oral",
            "Note": "17.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "O'SHEA Clare, MAZEAU Anne, MILSOM Julie"
        },
        {
            "Date": "18/12/2019",
            "Code": "1920_ISEN_CPG2_PART1_ANGLAIS_LISTENING",
            "Libellé": "Partiel 1 d'Anglais - Listening",
            "Note": "16.66",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "O'SHEA Clare, MAZEAU Anne, MILSOM Julie"
        },
        {
            "Date": "18/12/2019",
            "Code": "1920_ISEN_CPG2_PART1_ANGLAIS_ECRIT",
            "Libellé": "Partiel 1 d'Anglais - Ecrit",
            "Note": "17.10",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "O'SHEA Clare, MAZEAU Anne, MILSOM Julie"
        },
        {
            "Date": "14/12/2019",
            "Code": "1920_ISEN_CPG2_PART1_FHS",
            "Libellé": "Partiel 1 de FHS",
            "Note": "13.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "CHEVALIER Nicole"
        },
        {
            "Date": "07/12/2019",
            "Code": "1920_ISEN_CPG2_SI_DS2",
            "Libellé": "DS n°2",
            "Note": "14.70",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "30/11/2019",
            "Code": "1920_ISEN_CPG2_PHYS_DS3",
            "Libellé": "DS n°3",
            "Note": "17.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "23/11/2019",
            "Code": "1920_ISEN_CPG2_MATHS_DS3",
            "Libellé": "DS n°3",
            "Note": "16.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "09/11/2019",
            "Code": "1920_ISEN_CPG2_SI_DS1",
            "Libellé": "DS n°1",
            "Note": "18.40",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "18/10/2019",
            "Code": "1920_ISEN_CPG2_PHYS_DS2",
            "Libellé": "DS n°2",
            "Note": "19.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "18/10/2019",
            "Code": "1920_ISEN_CPG2_ANGLAIS_DS1",
            "Libellé": "DS n°1",
            "Note": "15.90",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "12/10/2019",
            "Code": "1920_ISEN_CPG2_MATHS_DS2",
            "Libellé": "DS n°2",
            "Note": "14.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "05/10/2019",
            "Code": "1920_ISEN_CPG2_FHS_DS2",
            "Libellé": "DS n°2",
            "Note": "12.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "28/09/2019",
            "Code": "1920_ISEN_CPG2_PHYS_DS1",
            "Libellé": "DS n°1",
            "Note": "18.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "21/09/2019",
            "Code": "1920_ISEN_CPG2_MATHS_DS1",
            "Libellé": "DS n°1",
            "Note": "9.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "07/09/2019",
            "Code": "1920_ISEN_CPG2_FHS_DS1",
            "Libellé": "DS n°1",
            "Note": "13.75",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_SI_TP_S1",
            "Libellé": "TP S1",
            "Note": "17.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_SI_COLLES_S1",
            "Libellé": "Colles S1",
            "Note": "17.70",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_PHYS_TP_S1",
            "Libellé": "TP S1",
            "Note": "19.80",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_PHYS_INTERROS_S1",
            "Libellé": "Interros S1",
            "Note": "17.63",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_PHYS_COLLES_S1",
            "Libellé": "Colles S1",
            "Note": "17.70",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_MATHS_INTERROS_S1",
            "Libellé": "Interros et autres devoirs S1",
            "Note": "16.31",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_MATHS_COLLES_S1",
            "Libellé": "Colles S1",
            "Note": "16.70",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_INFO_CC1",
            "Libellé": "Contrôle continu S1",
            "Note": "14.90",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_FHS_RAPPORT",
            "Libellé": "Rapport de stage",
            "Note": "18.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": "CHEVALIER Nicole"
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_FHS_EXPOSE",
            "Libellé": "Exposé",
            "Note": "18.50",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_FHS_DNS2",
            "Libellé": "DNS n°2",
            "Note": "15.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_FHS_DNS1",
            "Libellé": "DNS n°1",
            "Note": "18.00",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_EPS_S1",
            "Libellé": "Contrôle continu S1",
            "Note": "Non noté",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_ANGLAIS_COLLES_S1",
            "Libellé": "Colles S1",
            "Note": "15.25",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        },
        {
            "Date": "01/09/2019",
            "Code": "1920_ISEN_CPG2_ANGLAIS_CLASSWORK_S1",
            "Libellé": "Classwork S1",
            "Note": "17.10",
            "Motif d'absence": "",
            "Appréciation": "",
            "Intervenants": ""
        }
    ]
    
    // const mdoc = createMarkDocument("p64002", m);
    // mongo.updateMarkDocument("p64002", m)
    // mongo.save(mdoc);

    asyncFunc = async (studentAurionID) => {
        console.log('IN asyncFUNC');
        const x = await mongo.getStudentMarks(studentAurionID)
        console.log('test : ', x);
        console.log('test : ', typeof(x));
    };

    asyncFunc("p6400");
}
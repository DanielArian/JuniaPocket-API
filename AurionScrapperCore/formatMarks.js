const cheerio = require('cheerio');

function getColumnsTitle(parsedPage) {
    /**
     * @param {cherrie.CherrioAPI} parsedPage - La page de notes parsed avec cheerio
     * @return {Array} Liste des titres de chaque colonne, de gauche à droite.
     *                  En cas d'erreur, renvoie une liste vide.
     */


    let Titles = [];
    let cssPath = '.ui-datatable-tablewrapper > table:nth-child(1) > thead > tr > th > .ui-column-title';
    if (parsedPage(cssPath).length == 0) {
        console.log('Erreur : en tete du tableau non trouvé.');
        return Titles;
    }
    parsedPage(cssPath).each((index, element) => {
        Titles.push(parsedPage(element).text())
    });
    return Titles;
}


function getTableContent(parsedPage, arrColumnsTitle) {
    /**
     * @param {cherrie.CherrioAPI} parsedPage - La page de notes parsed avec cheerio
     * @return {Array} Cet array contient des listes. Le contenu de chaque liste 
     *          correspond au contenu d'une ligne du tableau et est au format string.
     *          En cas d'erreur, renvoie une liste vide.
     */

    let Content = []
    let nbOfLines = parsedPage('.ui-datatable-tablewrapper > table:nth-child(1) > tbody > tr').length
    if (nbOfLines == 0) {
        return Content;
    }
    for (var lineNumber = 1; lineNumber <= nbOfLines; lineNumber++) {
        let LineContent = []
        let cssPathToElemsInNthLine = `.ui-datatable-tablewrapper > table:nth-child(1) > tbody > tr:nth-child(${lineNumber}) > td`;
        parsedPage(cssPathToElemsInNthLine).each((index, element) => {
            // le texte dans une cellule est toujours au format : titrecolonneDonneeDeLaCellulle
            let c = parsedPage(element).text().split(arrColumnsTitle[index])[1];
            LineContent.push(c)
        });
        Content.push(LineContent);
    }
    return Content;
}


function sortTableContentByDate(arrColumnsTitle, arrTableContent) {
    /**
     * @param {Array} arrColumnsTitle - Resultat de la fonction getColumnsTitle
     * @param {Array} arrTableContent - Resultat de la fonction getTableContent
     * @return {Array} Renvoie arrTableContent trié par dates décroissantes.
     *                  Si la colonne 'Date' n'existe pas, renvoie arrTableContent
     *                  sans changements.
     */

    // On cherche l'index de la colonne 'Date' sur une ligne du tableau
    let dateIndex = -1;
    let i = 0;
    while (dateIndex < 0 && i < arrColumnsTitle.length) {
        if (arrColumnsTitle[i] == 'Date') {
            dateIndex = i;
        }
        else {
            i++;
        }
    }
    if (dateIndex < 0) {
        console.log("Il n'y a pas de colonne 'Date' dans le tableau.");
        return arrTableContent;
    }

    // On trie le contenu par dates décroissantes
    /* Tri dans l'ordre croissant de date puis on inverse le sens de l'array.
    * La partie a[].slice(6, 10) + a[].slice(3, 5) + a[].slice(0, 2) correspond à
    * ré-écrire la date 'jj/mm/aaaa' au format 'aaaammjj' pour que la comparaison
    * faite par la fonction dans sorted ait du sens.
    */
    arrTableContent.sort(function(a, b) {
        let dateA = Number(a[dateIndex].slice(6, 10) + a[dateIndex].slice(3, 5) + a[dateIndex].slice(0, 2));
        let dateB = Number(b[dateIndex].slice(6, 10) + b[dateIndex].slice(3, 5) + b[dateIndex].slice(0, 2));
        return dateA - dateB;
    });
    return arrTableContent.reverse();
}


function associateContentValuesToColumnsTitle(arrColumnsTitle, arrTableContent) {
    /**
     * @param {Array} arrColumnsTitle - Resultat de la fonction getColumnsTitle
     * @param {Array} arrTableContent - Resultat de la fonction getTableContent
     * @return {Array} Liste de dictionnaires. Chaque dico correspond à une ligne de note.
     */

    let Content = [];
    let lineLength = arrColumnsTitle.length;

    for (line of arrTableContent) {
        lineContentDic = {}
        for (let i = 0; i < lineLength; i++) {
            lineContentDic[arrColumnsTitle[i]] = line[i];
        }
        Content.push(lineContentDic);
    }
    return Content;
}


function getFormatedMarks(htmlMarksPage) {
    /**
     * @param {string} htmlMarkPage - Contenu de la 1ere page (si plusieurs) de notes
     * @return {Array} Liste de dictionnaires. Chaque dico correspond à une ligne de note.
     */

    var parsedPage = cheerio.load(htmlMarksPage);

    var ColumnsTitle = getColumnsTitle(parsedPage);
    if (ColumnsTitle == []) {
        return []
    }

    var TableContent = getTableContent(parsedPage, ColumnsTitle);
    TableContent = sortTableContentByDate(ColumnsTitle, TableContent);
    let DataToSend = associateContentValuesToColumnsTitle(ColumnsTitle, TableContent);
    return DataToSend;
}

module.exports = { getFormatedMarks };
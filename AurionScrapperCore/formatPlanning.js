const cheerio = require('cheerio');


function getStudentName(htmlPlanningPage) {
    const parsedPage = cheerio.load(htmlPlanningPage);
    let studentName = parsedPage('.divCurrentUser').text();
    return studentName;
}


function getNumberOfEventsInADay(parsedPage, nthDay) {
    /**
     * @param {cheerie.CheerioAPI} parsedPage - Parsed web page
     * @param {Number} nthDay - From 1 to 6 (from Monday to Saturday)
     * @return {Number} Number of events in a given Day.
     * 
     * On appelle "event" un événement dans le planning. Cela
     * peut être un cours ou tout autre chose.
    */

    if (nthDay < 1 || nthDay > 6) {
        return 0;
    }
    // Décalage de 1 du jour car le premier child correspond à l'axe des horaires
    nthDay = nthDay + 1;
    nthDayColumn = parsedPage(`.fc-content-skeleton > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(${nthDay}) > div:nth-child(1) > div:nth-child(2)`);
    return nthDayColumn.find('a').length;
}


function getEventsInADay(parsedPage, nthDay) {
    /**
     * @param {cheerie.CheerioAPI} parsedPage - Parsed web page
     * @param {Number} nthDay - From 1 to 6 (from Monday to Saturday)
     * @return {Array} [date, Events] : Date of the day (string: aaaa/mm/dd) 
     *                      and a list of dictionnaries containning of an event
     *                      planned for that day.
     * 
     * Events est une liste qui contient les parsedHTML de chaque event
     * de la journée.
     */

    if (nthDay < 1 || nthDay > 6) {
        return 0;
    }
    // Décalage de 1 du jour car le premier child du selecteur correspond à l'axe des horaires
    day = nthDay + 1;

    var dateOfTheDay = parsedPage(`th.fc-day-header:nth-child(${day})`).data()['date'];

    var Events = [];
    const nbOfEvents = getNumberOfEventsInADay(parsedPage, nthDay);
    for (i = 1; i < nbOfEvents + 1; i++) {
        var event = parsedPage(`.fc-content-skeleton > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(${day}) > div:nth-child(1) > div:nth-child(2) > a:nth-child(${i})`)
        // var eventData = event.find('.fc-title');
        Events.push(event);
    }
    return [dateOfTheDay, Events];
}


function formatEventsOfADay(dateOfTheDay, events) {
    /**
     * @param {string} dateOfTheDay - "aaaa/mm/jj"
     * @param {Object} events - élément renvoyé par la fonction getEventsInADay
     * @return {array} Un liste de dictionnaire qui correspondent chacun à
     *                  un event de la journée. Les attributs de ces dict sont :
     *                  date, room, eventName, startTime, endTime, teacher, other, isAnExam
     */

    var formatedEvents = []

    for (var i = 0; i < events.length; i++) {

        // Vérifie si c'est un examen
        var isAnExam = 'non';
        var examNode = events[i].find('i');
        if (examNode.length > 0) {
            if (examNode[0].attribs['title'] == 'Est une épreuve') {
                isAnExam = 'oui';
            }
        }

        /* Dans la ligne suivante, l'intérêt d'utiliser reverse c'est que l'on sait que
         les valeurs de teacher, startTime et endTime sont générallement fixes à la fin
         de la liste. Le reste inconnu de la liste de base est placé dans 'other' */
        var eventData = events[i].find('.fc-title').html().split('<br>').reverse();

        var tempEvent = {
            'date': dateOfTheDay,
            'room': eventData[3],
            'eventName': eventData[2],
            'startTime': eventData[1].split(' - ')[0],
            'endTime': eventData[1].split(' - ')[1],
            'teacher': eventData[0],
            'other': eventData.slice(4).toString(),
            'isAnExam': isAnExam
        }
        formatedEvents.push(tempEvent);
    }
    return formatedEvents;
}


function getEventsOfAWeek(parsedPage) {
    /**
     * @param {cheerie.CheerioAPI} parsedPage - Parsed web page
     * @return {array} Un liste de 6 sous listes. Chaque sous liste correspond à
     *                  un jour de la semaine. Dans chaque sous liste, on trouve
     *                  un ensemble de dictionnaire qui correspondent chacun à
     *                  un event de la journée. Les attributs de ces dict sont :
     *                  date, room, eventName, startTime, endTime, teacher, other, isAnExam
     */

    let formatedEventsOfTheWeek = {};
    for (var day = 1; day < 7; day += 1) {
        let [dateOfTheDay, events] = getEventsInADay(parsedPage, day);
        let date = new Date(dateOfTheDay).toUTCString();
        let tempFormatedEventsOfTheDay = formatEventsOfADay(date, events);
        formatedEventsOfTheWeek[date] = tempFormatedEventsOfTheDay;
    }
    return formatedEventsOfTheWeek;
}


function getDateOfISOWeek(w, y) {
    var simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}


function getWeekNumber(parsedPage) {
    var weekAndYear = parsedPage('input.ui-inputfield.ui-inputtext.ui-widget.ui-state-default.ui-corner-all').attr('value');
    var [w, y] = weekAndYear.split('-');
    return [w, y];
}


function responseWeekPlanning(htmlPlanningPage) {
    var parsedPage = cheerio.load(htmlPlanningPage);
    var WeekPlanning = getEventsOfAWeek(parsedPage);
    var [w, y] = getWeekNumber(parsedPage);
    var beginDate = getDateOfISOWeek(w, y).toDateString().split('T')[0];
    var Planning = {
        'weekNumber': w,
        'year': y,
        'beginDate': beginDate,
        'data': WeekPlanning
    };
    return Planning;
}

module.exports = { responseWeekPlanning }

// console.log(getDateOfISOWeek(15, 2021));
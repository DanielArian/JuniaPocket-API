const fs = require('fs');
const aurionScrapper = require('./index');

var req = [
    // ["h19190", "Akatsuki526*", '21/05/2021'],
    // ["p64002", "TTczDm00", '02/04/2021'],
    ["Lucile.wiech", "LuQuLy59#", '21/03/2021']
];


(async () => {
    for (el of req) {
        let r = await aurionScrapper.fetch.planning(el[0], el[1], el[2]);
        fs.writeFile(`./json_planning_${el[0]}.json`, JSON.stringify(aurionScrapper.formatPlanning.responseWeekPlanning(r)), err => {
            if (err) {
                console.error(err)
                return
            }
            //file written successfully
        })
    }
})()
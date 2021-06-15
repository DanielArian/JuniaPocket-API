const puppeteer = require('puppeteer');
const { PendingXHR } = require('pending-xhr-puppeteer');

const login_url = "http://aurion.junia.com/faces/Login.xhtml";


async function check_if_logged_in(page) {
    // Check if logged in
    r = await page.content();
    if (r.includes('Déconnexion')) { return true };
    if (r.includes('invalide')) { return false };
};


async function connection(page, username, password) {
    console.log(`Connexion à Aurion de ${username}...`);
    try {
        await page.goto(login_url);
    }
    catch (err) {
        console.log(err);
        return false;
    }
    await page.type('#username', username);
    await page.type('#password', password);
    await page.keyboard.press('Enter');
    try {
        await page.waitForNavigation();
    }
    catch (err) {
        console.log(err)
        return false;
    }

    const reponse_log_in = await check_if_logged_in(page);
    if (reponse_log_in == false) {
        console.log("Username ou mot de passe invalide.");
        return false;
    }
    console.log(`Connexion reussie de ${username}.`);
    return true;
}


async function checkAurionIDAndGetNameIfOk(username, password) {

    console.log(`Connexion à Aurion de l'utilisateur ${username} ...`);

    const browser = await puppeteer.launch({
        'args': [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    try {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'fr'
        });
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        });

        // Connection
        if (await connection(page, username, password) == false) {
            return 'INVALID'
        }
        const studentName = page.$eval('li.ui-widget-header', el => el.textContent);
    } catch (error) {
        console.log(`checkAurionIDAndGetNameIfOk --> ${error}`);
    } finally {
        await browser.close();
    }
    return studentName;
}


async function marks(username, password) {
    const browser = await puppeteer.launch({
        'args': [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    let pageContent;
    try {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'fr'
        });
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        });

        // Connection
        if (await connection(page, username, password) == false) {
            await browser.close();
            pageContent = 'Username ou mot de passe invalide.'
        }

        // Click on button Scolarité
        const myScheduleBtn = await page.$x("//*[contains(text(), 'Scolarité')]");
        if (myScheduleBtn.length > 0) {
            await myScheduleBtn[0].click();
        } else {
            throw new Error("Scolarité button not found");
        }
        await page.waitForXPath("//*[contains(text(), 'Mes notes')]");

        // Click on button Mes notes
        // Récupération array des buttons contenant la chaine "Mes notes"
        const myGradesBtn = await page.$x("//*[contains(text(), 'Mes notes')][@class='ui-menuitem-text']");
        // Recherche du bon bouton (Il y a parfois un bouton "Mes notes suite aux absences" par ex)
        let btnNumber = 0;
        while (await page.evaluate(el => el.textContent, myGradesBtn[btnNumber]) != 'Mes notes') {
            btnNumber++;
        };
        await myGradesBtn[btnNumber].click();
        await page.waitForNavigation();

        // Respond with the page content
        pageContent = await page.content();
        
        console.log("Notes recuperees avec succes !");
        
    } catch (error) {
        console.log(`fetch.marks error --> ${error}`);
    } finally {
        await browser.close();
    }
    return pageContent;
};


async function planning(username, password, date) {
    /**
     * date au format "jj/mm/aaaa"
     * Si on veut la date de la semaine actuelle, date = ""
     */

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    let pageContent;
    try {
        const page = await browser.newPage();
        const pendingXhr = new PendingXHR(page);
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'fr'
        });
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        });

        
        // Connection
        if (await connection(page, username, password) == false) {
            await browser.close();
            return 'Username ou mot de passe invalide.'
        }

        // Click on Mon Planning
        const myScheduleBtn = await page.$x("//*[contains(text(), 'Mon Planning')]");
        if (myScheduleBtn.length > 0) {
            await myScheduleBtn[0].click();
        } else {
            throw new Error("My Schedule button not found");
        }
        // Wait for xml content to be loaded
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        await pendingXhr.waitForAllXhrFinished();

        if (date != "") {
            champ = await page.$x('//*[@id="form:date_input"]');
            await champ[0].click({ clickCount: 3 });
            await page.keyboard.press('Backspace');

            await champ[0].type(date);
            await page.keyboard.press('Enter');

            await page.waitForTimeout(1000);

            buttonSearch = await page.$x('/html/body/div[1]/form/div[2]/div[2]/div/div[2]/div/div/div[2]/button/span[1]');
            await buttonSearch[0].click();

            // Wait for xml content to be loaded
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            await pendingXhr.waitForAllXhrFinished();
        }

        // Respond with the page content
        pageContent = await page.content()
        console.log("Planning recupere avec succes !");

    } catch (error) {
        console.log(`fetch.planning error --> ${error}`);
    } finally {
        await browser.close();
    }
    return pageContent;
};

module.exports = { marks, planning, checkAurionIDAndGetNameIfOk };
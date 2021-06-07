const puppeteer = require('puppeteer');

const login_url = "http://aurion.junia.com/faces/Login.xhtml";

var SESSIONID = "";

async function check_if_logged_in(page) {
    // Check if logged in
    r = await page.content();
    if (r.includes('Déconnexion')) { return true };
    if (r.includes('invalide')) { return false };
};


async function connection(page, username, password) {
    try{
        await page.goto(login_url);
    }
    catch(err) {
      console.log(err)
      return false;
    }
    await page.type('#username', username);
    await page.type('#password', password);
    await page.keyboard.press('Enter');
    try {
      await page.waitForNavigation();
    }
    catch(err) {
      console.log(err)
      return false;
    }

    const reponse_log_in = await check_if_logged_in(page);
    if (reponse_log_in == false) {
        console.log("Username ou mot de passe invalide.");
        return false;
    }
    console.log("Connexion reussie.");
    return true;
}


async function checkAurionIDAndGetSessionID(username, password) {
    const browser = await puppeteer.launch({
        'args': [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
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

    const cookies = await page.cookies();
    const sessionIdValue = cookies[0]["value"];
    return sessionIdValue;
}

const run = async () => {
    const c = await checkAurionIDAndGetSessionID("p64002", "TTczDm00");
    
}
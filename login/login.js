const fs = require('fs');
const webPage = require('webpage');

let index = 0;
let loadInProgress = false;

const page = webPage.create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.loadImages = false;
page.onLoadStarted = () => {
  loadInProgress = true;
  console.log('Loading started');
};
page.onLoadFinished = () => {
  loadInProgress = false;
  console.log('Loading finished');
};

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

const steps = [
  () => {
    console.log('Step 1 - Open Amazon Prime Now home page');
    page.open('https://primenow.amazon.fr/');
  },
  () => {
    console.log('Step 2 - Click on the PostalCode');
    page.evaluate(() => {
      document.getElementById('lsPostalCode').value = '75010';
      document.getElementsByClassName('a-button-input')[0].click();
    });
  },
  () => {
    console.log('Step 3 - Click on the Sign in button');
    page.evaluate(() => {
      document.getElementById('houdini-navYourAccount-button').click();
    });
  },
  () => {
    console.log('Step 4 - Populate and submit the login form');
    page.evaluate(() => {
      document.getElementById('ap_email').value = 'fabien.demaestri@gmail.com';
      document.getElementById('ap_password').value = 'BO+(w[5.u FKR#q%%-~v';
      document.forms.signIn.submit();
    });
  },
  () => {
    console.log('Step 5 - Save cookie in file');
    fs.write('cookiejar.json', JSON.stringify(phantom.cookies), 'w');
  }
];

function executeRequestsStepByStep() {
  if (loadInProgress === false && typeof steps[index] === 'function') {
    steps[index]();
    index += 1;
  }
  if (typeof steps[index] !== 'function') {
    console.log('test complete!');
    phantom.exit();
  }
}


console.log('All settings loaded, start with execution');
setInterval(executeRequestsStepByStep, 3000);

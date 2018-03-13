'use strict';

// Récupère les commande et les stocke les pages html dans le répertoire order

const request = require('request');
const fs = require('fs');

const cookies = JSON.parse(fs.readFileSync('./cookiejar.json', 'utf-8'));
const cheerio = require('cheerio');
const Crawler = require('crawler');

const url = 'https://primenow.amazon.fr/yourOrders';
const headers = {
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,es;q=0.2'
};

function cookieJar() {
  const jar = request.jar();
  cookies.forEach((cookie) => {
    const cookieParsed = request.cookie(`${cookie.name}=${cookie.value}`);
    jar.setCookie(cookieParsed, url);
  });
  return jar;
}

const c = new Crawler({
  gzip: true,
  jar: cookieJar(),
  headers,
  maxConnections: 10,
  callback(error, res, done) {
    if (error) {
      console.log(error);
    }
    else {
      const orderNumber = res.$('#browser-order-status-order-number').text().trim().split('N° de commande : ')[1];
      const fileName = `./orderPage/order[${orderNumber}].html`;
      fs.createWriteStream(fileName).write(res.body);
    }
    done();
  }
});

request
  .get({
    url,
    gzip: true,
    jar: cookieJar(),
    headers
  }, (err, response, body) => {
    const $ = cheerio.load(body);

    const links = $('#completed-orders table a')
      .map((d, value) => [].concat(`https://primenow.amazon.fr${$(value).attr('href')}`))
      .get()
      .filter(str => !str.includes('returns'))
      .filter(str => !str.includes('contactus'));

    c.queue(links);
  })
  .on('response', data => console.log(data.statusCode))
  .on('error', err => console.log(err))
  .pipe(fs.createWriteStream('./myoutput.html'));

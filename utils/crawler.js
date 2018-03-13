'use strict';

const request = require('request');

const cookies = require('../login/cookiejar.json');

const headers = {
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,es;q=0.2'
};

function cookieJar() {
  const jar = request.jar();
  cookies.forEach((cookie) => {
    const cookieParsed = request.cookie(`${cookie.name}=${cookie.value}`);
    jar.setCookie(cookieParsed, 'https://primenow.amazon.fr/');
  });
  return jar;
}

const crawler = {
  gzip: true,
  jar: cookieJar(),
  headers,
  maxConnections: 3
};

module.exports = crawler;

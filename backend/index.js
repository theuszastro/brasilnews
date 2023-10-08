const { JSDOM } = require('jsdom');

const { default: axios } = require('axios');
const fs = require('fs/promises');

(async () => {
    console.log(document.querySelector('#text-article').innerHTML);
})();

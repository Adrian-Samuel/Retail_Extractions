const axios = require('axios');
const download = require('image-downloader');

const instance = axios.create({
    baseURL: 'https://api.lightspeedapp.com/API/Account/{{accountID}}/',
    timeout: 30000,
    headers: {
        Authorization: 'Bearer {{access_token}}',
        Accept: 'application/json'

    }
});

(async () => {
    try {
        let offset = 0;
        let results = [];
        let next = true;

        while (next) {
            let request = await instance.get(`Image.json?&offset=${offset}`)

            let response = request.data;

            if (response.hasOwnProperty('Image')) {
                results.push(...response.Image);
                offset += 100;

            } else {
                next = false;
            }
        }

        for (let picture of results) {
            let imageURL = picture.baseImageURL + picture.publicID;

            const options = {
                url: `${imageURL}`,
                dest: 'Specify File Directory' // e.g. /Users/Name/Documents/RetailImages
            }

            const {
                filename,
                image
            } = await download.image(options);

        }
    } catch (err) {
        console.log(err);
    }

})();

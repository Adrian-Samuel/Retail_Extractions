/* 
A Node.js script to extract images from the system

To use:

1) Install Node (https://nodejs.org/en/download/)
2) Install Axios (https://github.com/axios/axios)
3) Install Image-Downloader (https://www.npmjs.com/package/image-downloader)

4) Specify accountID variable 
5) Specify fileLocation variable

Register and authenticate your client to get your access token:
https://developers.lightspeedhq.com/retail/authentication/authentication-overview/


*/



const axios = require('axios');
const download = require('image-downloader');

const accountID = insertNumber; // Insert your accountID here
const folderLocation  = 'Specify File Directory';  // e.g. /Users/Name/Documents/RetailImages

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
                dest: folderLocation
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

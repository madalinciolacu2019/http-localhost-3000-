const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'api.netlify.com',
  path: '/api/v1/deploys/6a426485743d090008bbd54f',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer nfc_wnuxc2hnh42ZP3oDXSe7cnv7RSju1CiT1907'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const deploy = JSON.parse(data);
    if (deploy.log_access_attributes && deploy.log_access_attributes.url) {
      console.log('Fetching log from:', deploy.log_access_attributes.url);
      https.get(deploy.log_access_attributes.url, (logRes) => {
        const file = fs.createWriteStream('build_log.txt');
        logRes.pipe(file);
        file.on('finish', () => console.log('Log saved to build_log.txt'));
      });
    } else {
      console.log('No log URL found', deploy);
    }
  });
});
req.on('error', (e) => console.error(e));
req.end();

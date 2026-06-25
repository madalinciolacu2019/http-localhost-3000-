const fs = require('fs');
const path = require('path');

async function uploadFile() {
  console.log("Fetching GoFile server...");
  try {
    const serverRes = await fetch('https://api.gofile.io/servers');
    const serverData = await serverRes.json();
    if (serverData.status !== 'ok') throw new Error('Failed to get server');
    
    const server = serverData.data.servers[0].name;
    console.log(`Uploading to ${server}.gofile.io... (This may take a minute for 108MB)`);
    
    const filePath = path.join(__dirname, 'android/app/build/outputs/apk/release/app-release.apk');
    const fileStats = fs.statSync(filePath);
    
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'application/vnd.android.package-archive' });
    formData.append('file', fileBlob, 'ApexBrews.apk');
    
    const uploadRes = await fetch(`https://${server}.gofile.io/contents/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadRes.json();
    if (uploadData.status === 'ok') {
      console.log('UPLOAD SUCCESSFUL!');
      console.log('Download Link: ' + uploadData.data.downloadPage);
    } else {
      console.error('Upload failed:', uploadData);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

uploadFile();

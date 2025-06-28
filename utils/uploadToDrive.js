import { google } from 'googleapis';
import path from 'path';
import mime from 'mime-types';
import fs from 'fs/promises';

const serviceKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

// Authenticate with Google Drive
const auth = new google.auth.GoogleAuth({
  credentials: serviceKey,
  scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });

const ROOT_FOLDER_ID = '1I0pyEehFcqsBS-KyLvutPIQfh3RGAC50'; // GLF Application folder ID

// Create a subfolder named after the applicant (form no or name)
export async function createApplicantFolder(applicantName) {
  const folderMetadata = {
    name: applicantName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [ROOT_FOLDER_ID],
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  return folder.data.id;
}

// Upload files into the applicant’s subfolder
export async function uploadFilesToDrive(files, folderId) {
  const uploadedUrls = [];

  for (const file of files) {
    const mimeType = mime.lookup(file.originalname) || 'application/octet-stream';

    const media = {
      mimeType,
      body: await fs.readFile(file.path),
    };

    const fileMeta = {
      name: file.originalname,
      parents: [folderId],
    };

    const uploaded = await drive.files.create({
      requestBody: fileMeta,
      media,
      fields: 'id',
    });

    const fileId = uploaded.data.id;

    // Make file public
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    uploadedUrls.push({ name: file.originalname, url: publicUrl });
  }

  return uploadedUrls;
}

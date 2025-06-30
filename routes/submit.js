import express from 'express';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import { createApplicantFolder, uploadFilesToDrive } from '../utils/uploadToDrive.js';

const router = express.Router();
const mongoUri = process.env.MONGODB_URI;

// Multer setup to handle file uploads
const storage = multer.diskStorage({
  destination: '/tmp',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// POST route: receives form fields + file uploads
router.post('/', upload.array('documents', 10), async (req, res) => {
  try {
    const formData = JSON.parse(req.body.data);
    const uploadedFiles = req.files;

    if (!formData || !uploadedFiles.length) {
      return res.status(400).json({ message: 'Form or files missing' });
    }

    // Name the folder using form value
    const applicantFolderName = formData.textValue || 'Unnamed_Applicant';
    const folderId = await createApplicantFolder(applicantFolderName);

    // Split uploaded files: first is singleFile, rest are multipleFiles
    const singleFileList = uploadedFiles.length > 0 ? [uploadedFiles[0]] : [];
    const multipleFileList = uploadedFiles.length > 1 ? uploadedFiles.slice(1) : [];

    // Upload to Google Drive
    const uploadedSingleFile = await uploadFilesToDrive(singleFileList, folderId);
    const uploadedMultipleFiles = await uploadFilesToDrive(multipleFileList, folderId);

    // Store in MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('glf_form_db');
    const submissions = db.collection('submissions');

    const result = await submissions.insertOne({
      ...formData,
      uploadedSingleFile,
      uploadedMultipleFiles,
      createdAt: new Date(),
    });

    await client.close();

    res.status(200).json({
      message: 'Form submitted and files uploaded!',
      id: result.insertedId,
    });
  } catch (error) {
    console.error('❌ Submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

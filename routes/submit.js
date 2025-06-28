import express from 'express';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import { createApplicantFolder, uploadFilesToDrive } from '../utils/uploadToDrive.js';

const router = express.Router();
const mongoUri = process.env.MONGODB_URI;

// Use multer to handle file uploads (store in /tmp folder)
const storage = multer.diskStorage({
  destination: '/tmp', // Works on Render
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// POST route: receives form fields + multiple files
router.post('/', upload.array('documents', 10), async (req, res) => {
  try {
    const formData = JSON.parse(req.body.data); // assuming form fields are sent as a JSON string in `data`
    const uploadedFiles = req.files;

    if (!formData || !uploadedFiles.length) {
      return res.status(400).json({ message: 'Form or files missing' });
    }

    // Define subfolder name (e.g., using name or form number)
    const applicantFolderName = formData.textValue || 'Unnamed_Applicant';
    const folderId = await createApplicantFolder(applicantFolderName);

    // Upload files to Google Drive subfolder
    const uploadedUrls = await uploadFilesToDrive(uploadedFiles, folderId);

    // Save to MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('glf_form_db');
    const submissions = db.collection('submissions');

    const result = await submissions.insertOne({
      ...formData,
      uploadedDocuments: uploadedUrls,
      createdAt: new Date(),
    });

    await client.close();

    res.status(200).json({ message: 'Form submitted and files uploaded!', id: result.insertedId });
  } catch (error) {
    console.error('❌ Submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

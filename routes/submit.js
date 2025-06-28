const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

// Read MongoDB URI from environment variable
const mongoUri = process.env.MONGODB_URI;

// POST /api/submit
router.post('/', async (req, res) => {
  const formData = req.body;

  if (!mongoUri) {
    console.error("MONGODB_URI is not defined.");
    return res.status(500).json({ message: 'Database configuration error.' });
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('glf_form_db');
    const submissions = db.collection('submissions');

    const result = await submissions.insertOne(formData);

    await client.close();

    console.log('✅ Form saved to MongoDB with ID:', result.insertedId);
    res.status(200).json({ message: 'Form data saved successfully.' });
  } catch (error) {
    console.error('❌ MongoDB Error:', error);
    res.status(500).json({ message: 'Failed to save form data.' });
  }
});

module.exports = router;

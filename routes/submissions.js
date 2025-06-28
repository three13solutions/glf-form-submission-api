import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();
const mongoUri = process.env.MONGODB_URI;

router.get('/', async (req, res) => {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('glf_form_db');
    const submissions = db.collection('submissions');

    const allSubmissions = await submissions.find().sort({ _id: -1 }).toArray();

    await client.close();

    res.json(allSubmissions); // You can replace this with an HTML response later
  } catch (error) {
    console.error('❌ Error fetching submissions:', error);
    res.status(500).json({ message: 'Failed to fetch submissions.' });
  }
});

export default router;

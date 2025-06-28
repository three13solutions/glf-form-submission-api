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

    res.render('dashboard', { submissions: allSubmissions });
  } catch (error) {
    console.error('❌ Error rendering dashboard:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;

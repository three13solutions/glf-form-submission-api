import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();
const mongoUri = process.env.MONGODB_URI;

router.get('/view/:id', async (req, res) => {
  const applicantId = req.params.id;

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('glf_form_db');
    const submissions = db.collection('submissions');
    const submission = await submissions.findOne({ _id: new ObjectId(applicantId) });

    await client.close();

    if (!submission) {
      return res.status(404).send('Applicant not found');
    }

    res.render('viewApplicant', { submission });
  } catch (error) {
    console.error('❌ Error fetching applicant:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;

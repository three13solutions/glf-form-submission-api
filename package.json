const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const formData = req.body;

  console.log('✅ Received Form Submission:');
  console.log(formData);

  return res.status(200).json({ message: 'Form data received successfully.' });
});

module.exports = router;

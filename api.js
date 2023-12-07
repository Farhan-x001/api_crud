import express from 'express';
import mongoose from 'mongoose';
import { check, validationResult } from 'express-validator';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

mongoose.connect('mongodb+srv://Farhan:Masoor7812@cluster0.vcbhr5b.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const recordSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  title: String,
  body: String,
});

const Record = mongoose.model('Record', recordSchema);

app.use(express.json());

const validateInput = [
  check('userId').isInt().withMessage('User ID must be an integer'),
];

app.get('/all-data', async (req, res) => {
  try {
    const allRecords = await Record.find();
    res.json(allRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/delete-record/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const deletedRecord = await Record.findOneAndDelete({ userId: userId });

    if (!deletedRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully', deletedRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/fetch-specific-data', validateInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.query.userId;

  try {
    if (!userId) {
      throw new Error('Internal Server Error');
    }

    const existingRecord = await Record.findOne({ userId: userId });
    if (existingRecord) {
      return res.json(existingRecord);
    }

    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.get('/all-external-data', async (req, res) => {
//   try {
//     const response = await fetch('https://jsonplaceholder.typicode.com/posts');

//     if (!response.ok) {
//       throw new Error(`Error fetching data: ${response.statusText}`);
//     }

//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

app.get('/retrieve-record/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const retrievedRecord = await Record.findOne({ userId: userId });

    if (!retrievedRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(retrievedRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update the /save-data route
// app.post('/save-data', validateInput, async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const userId = req.body.userId;

//   try {
//     if (!userId) {
//       throw new Error('Internal Server Error');
//     }

//     // Check if the record already exists in the database
//     const existingRecord = await Record.findOne({ userId: userId });

//     if (existingRecord) {
//       // If the record exists in the database, return it
//       return res.status(200).json(existingRecord);
//     }

//     // Fetch data from the external API
//     const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);

//     if (!response.ok) {
//       throw new Error(`Error fetching data: ${response.statusText}`);
//     }

//     const data = await response.json();

//     // Save the fetched record to the MongoDB database
//     const newRecord = new Record({
//       userId: userId,
//       title: data[0].title, // Assuming the API response is an array of posts
//       body: data[0].body,
//     });

//     // Check again before saving to avoid duplicate records
//     const duplicateCheck = await Record.findOne({ userId: userId });
//     if (!duplicateCheck) {
//       await newRecord.save();
//       res.status(200).json(newRecord);
//     } else {
//       res.status(200).json(existingRecord);
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



app.post('/save-all-external-data', async (req, res) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    // Save all records to the MongoDB database (skip duplicates)
    await Record.insertMany(data, { ordered: false });

    res.status(200).json({ message: 'All records saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, this is the root path');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

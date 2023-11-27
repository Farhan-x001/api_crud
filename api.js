import express from 'express';
import { check, validationResult } from 'express-validator';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

app.use(express.json());

const validateInput = [
  check('Id').isInt().withMessage('User ID must be an integer'), 
];

app.get('/fetch-data', validateInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.query.Id;

  try {
    if (!userId) {
      
      throw new Error('Internal Server Error');
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

app.get('/all-data', async (req, res) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');

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

app.get('/', (req, res) => {
  res.send('Hello, this is the root path');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

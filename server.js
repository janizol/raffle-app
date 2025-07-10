const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { stringify } = require('csv-stringify');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Path to JSON file
const DATA_FILE = path.join(__dirname, 'data', 'reservations.json');

// Initialize numbers (1–100)
const ALL_NUMBERS = Array.from({ length: 100 }, (_, i) => i + 1);

// Helper: Load reservations
function loadReservations() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

// Helper: Save reservations
function saveReservations(reservations) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reservations, null, 2));
}

// GET available numbers
app.get('/api/available-numbers', (req, res) => {
  const reservations = loadReservations();
  const reservedNumbers = reservations.flatMap(r => r.numbers);
  const available = ALL_NUMBERS.filter(n => !reservedNumbers.includes(n));
  res.json({ available });
});

// POST reserve numbers
app.post('/api/reserve', async (req, res) => {
  const { name, student, numbers } = req.body;

  if (!name || !student || !numbers || !Array.isArray(numbers)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  if (numbers.length === 0 || numbers.length > 20) {
    return res.status(400).json({ error: "Select between 1 and 20 numbers" });
  }

  try {
    const data = await fs.readFile(dataFile, 'utf-8');
    const reservations = JSON.parse(data);
    const reservedNumbers = reservations.flatMap(r => r.numbers);

    const unavailable = numbers.filter(n => reservedNumbers.includes(n));
    if (unavailable.length > 0) {
      return res.status(400).json({ error: `Numbers already taken: ${unavailable.join(", ")}` });
    }

    // ✅ Add timestamp here
    reservations.push({
      name,
      student,
      numbers,
      timestamp: new Date().toISOString()
    });

    await fs.writeFile(dataFile, JSON.stringify(reservations, null, 2));

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving reservation" });
  }
});


// GET export CSV
app.get('/api/export', (req, res) => {
  const reservations = loadReservations();

  const records = [];
  reservations.forEach(r => {
    r.numbers.forEach(n => {
      records.push({
        Name: r.name,
        Student: r.student,
        Number: n
      });
    });
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="reservations.csv"');

  stringify(records, { header: true }).pipe(res);
});

// DELETE reservation of specific number
app.get('/api/empty/:number', (req, res) => {
  const numberToRemove = parseInt(req.params.number, 10);

  let reservations = loadReservations();
  let found = false;

  reservations = reservations.flatMap(r => {
    if (r.numbers.includes(numberToRemove)) {
      found = true;
      // Remove the number
      const remainingNumbers = r.numbers.filter(n => n !== numberToRemove);
      // If no numbers left, remove the whole record
      return remainingNumbers.length > 0
        ? [{ ...r, numbers: remainingNumbers }]
        : [];
    } else {
      return [r];
    }
  });

  saveReservations(reservations);

  if (found) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Number not reserved' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

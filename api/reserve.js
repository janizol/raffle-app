import { promises as fs } from "fs";
import path from "path";

const ALL_NUMBERS = Array.from({ length: 100 }, (_, i) => i + 1);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const dataFile = path.join(process.cwd(), "data", "reservations.json");
  const { name, student, numbers } = req.body;

  if (!name || !student || !numbers || !Array.isArray(numbers)) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  if (numbers.length === 0 || numbers.length > 20) {
    res.status(400).json({ error: "Select between 1 and 20 numbers" });
    return;
  }

  try {
    const data = await fs.readFile(dataFile, "utf-8");
    const reservations = JSON.parse(data);
    const reservedNumbers = reservations.flatMap(r => r.numbers);

    const unavailable = numbers.filter(n => reservedNumbers.includes(n));
    if (unavailable.length > 0) {
      res.status(400).json({ error: `Numbers already taken: ${unavailable.join(", ")}` });
      return;
    }

    reservations.push({ name, student, numbers });
    await fs.writeFile(dataFile, JSON.stringify(reservations, null, 2));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving reservation" });
  }
}

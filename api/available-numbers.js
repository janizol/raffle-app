import { promises as fs } from "fs";
import path from "path";

const ALL_NUMBERS = Array.from({ length: 100 }, (_, i) => i + 1);

export default async function handler(req, res) {
  const dataFile = path.join(process.cwd(), "data", "reservations.json");

  try {
    const data = await fs.readFile(dataFile, "utf-8");
    const reservations = JSON.parse(data);
    const reservedNumbers = reservations.flatMap(r => r.numbers);
    const available = ALL_NUMBERS.filter(n => !reservedNumbers.includes(n));
    res.status(200).json({ available });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error reading reservations" });
  }
}

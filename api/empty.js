import { promises as fs } from "fs";
import path from "path";

export default async function handler(req, res) {
  const dataFile = path.join(process.cwd(), "data", "reservations.json");
  const { number } = req.query;
  const numToRemove = parseInt(number, 10);

  try {
    const data = await fs.readFile(dataFile, "utf-8");
    let reservations = JSON.parse(data);
    let found = false;

    reservations = reservations.flatMap(r => {
      if (r.numbers.includes(numToRemove)) {
        found = true;
        const remaining = r.numbers.filter(n => n !== numToRemove);
        return remaining.length > 0 ? [{ ...r, numbers: remaining }] : [];
      }
      return [r];
    });

    await fs.writeFile(dataFile, JSON.stringify(reservations, null, 2));

    if (found) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: "Number not reserved" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating reservations" });
  }
}

import { promises as fs } from "fs";
import path from "path";
import { stringify } from "csv-stringify/sync";

export default async function handler(req, res) {
  const dataFile = path.join(process.cwd(), "data", "reservations.json");

  try {
    const data = await fs.readFile(dataFile, "utf-8");
    const reservations = JSON.parse(data);

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

    const csv = stringify(records, { header: true });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reservations.csv");
    res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error exporting CSV" });
  }
}

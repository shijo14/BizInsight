import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function test() {
  try {
    const buffer = fs.readFileSync('test/data/05-versions-space.pdf');
    const parser = new PDFParse({ data: buffer });
    const info = await parser.getInfo();
    console.log("Info:", info);
    const data = await parser.getText();
    console.log("Text length:", data.text.length);
    await parser.destroy();
  } catch (err) {
    console.error("Error:", err);
  }
}
test();

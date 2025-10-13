import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.text({ type: 'text/html', limit: "5mb" }));

app.post("/generate-pdf", async (req, res) => {
    const html = req.body;

    if (!html) {
        return res.status(400).send('No HTML provided');
    }

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="resume.pdf"',
        });

        res.send(pdfBuffer);
    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).send('Failed to generate PDF');
    }
});
//
app.listen(3001, () => console.log("PDF server running on port 3001"));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import fs from "fs";

import userRoutes from "./routes/userRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import styleRoutes from "./routes/styleRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use('/assets', express.static('public/assets'));
app.use(express.json());

// routes
app.use("/api/userdata", userRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/template-styles", styleRoutes);

// PDF generation route
app.use(express.text({ type: 'text/html', limit: "5mb" }));

app.post("/generate-pdf", async (req, res) => {
    const html = req.body;

    if (!html) {
        return res.status(400).send('No HTML provided');
    }
    console.log('Puppeteer Executable Path:', puppeteer.executablePath());

    try {
        const browser = await puppeteer.launch({
            headless: true,
            userDataDir: '/tmp/puppeteer', 
            executablePath: puppeteer.executablePath(),
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
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

// Set port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

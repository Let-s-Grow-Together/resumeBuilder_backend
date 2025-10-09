import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/generate-pdf", async (req, res) => {
    console.log("Received HTML length:", req.body.html?.length);

    const { html } = req.body;
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
    });

    await browser.close();
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
});

app.listen(3001, () => console.log("PDF server running on port 3001"));

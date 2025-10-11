import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import fs from "fs";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));

app.post("/generate-pdf", async (req, res) => {
    const { html } = req.body;
    console.log("Received HTML length:", html?.length);

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });

    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.waitForSelector(".resume-view", { visible: true }).catch(() => {
        console.log("⚠️ .resume-view not found — rendering anyway...");
    });

    await page.evaluateHandle("document.fonts.ready");
    await page.screenshot({ path: "debug.png", fullPage: true });
    console.log("✅ Screenshot saved as debug.png");

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
    });

    // 🧩 Save the PDF locally for debugging
    fs.writeFileSync("resume-test.pdf", pdfBuffer);
    console.log("✅ Saved PDF as resume-test.pdf (check this file manually)");

    await browser.close();

    // Set the response headers to indicate this is a PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
    
    // Send the PDF as a response
    res.send(pdfBuffer);
});
//
app.listen(3001, () => console.log("PDF server running on port 3001"));

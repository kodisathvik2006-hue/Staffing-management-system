import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { invoiceTemplate } from './invoice-template';
import fs from 'fs';

Handlebars.registerHelper('formatCurrency', function (value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
});

export async function generateInvoicePdf(data: any): Promise<Buffer> {
  const template = Handlebars.compile(invoiceTemplate);
  
  data.generatedAt = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: true
  });
  
  const html = template(data);

  const browserPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ];

  let executablePath = '';
  for (const path of browserPaths) {
    if (fs.existsSync(path)) {
      executablePath = path;
      break;
    }
  }

  const browser = await puppeteer.launch({
    executablePath: executablePath || undefined,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1200, height: 1600 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

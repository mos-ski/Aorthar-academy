const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, 'full_documentation.html');
  const pdfPath = path.resolve(__dirname, 'full_documentation.pdf');

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '40px',
      right: '40px',
      bottom: '40px',
      left: '40px',
    },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:9px;color:#9ca3af;font-family:Inter,sans-serif;padding:0 40px;width:100%;text-align:left;">Aorthar Academy — Documentation</div>',
    footerTemplate: '<div style="font-size:9px;color:#9ca3af;font-family:Inter,sans-serif;padding:0 40px;width:100%;text-align:right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log('PDF generated successfully:', pdfPath);
})();

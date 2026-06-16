'use strict';

const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extract text from a PDF file. (FR-02 / WBS 2.3)
 * Captures per-page text so we can attach page numbers to chunks (WBS 2.3.3).
 *
 * @param {string} filePath
 * @returns {Promise<{ pages: {pageNumber:number, text:string}[], pageCount:number, fullText:string }>}
 * @throws  Error with code 'EXTRACT_EMPTY' if the PDF has no extractable text.
 */
async function extractPdf(filePath) {
  const buffer = fs.readFileSync(filePath);

  const pages = [];
  // pagerender hook lets us collect text page-by-page.
  const options = {
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      const text = textContent.items.map((it) => it.str).join(' ');
      pages.push({ pageNumber: pages.length + 1, text });
      return text;
    },
  };

  const data = await pdfParse(buffer, options);
  const pageCount = data.numpages || pages.length;

  const fullText = pages
    .map((p) => p.text)
    .join('\n')
    .trim();

  if (!fullText) {
    const err = new Error(
      'No extractable text found in PDF (it may be scanned/image-only; OCR is out of scope).'
    );
    err.code = 'EXTRACT_EMPTY';
    throw err;
  }

  return { pages, pageCount, fullText };
}

module.exports = { extractPdf };

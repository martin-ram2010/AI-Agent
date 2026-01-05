const pdfParse = require('pdf-parse');

console.log('Type of pdf-parse:', typeof pdfParse);
console.log('Keys of pdf-parse:', Object.keys(pdfParse));
console.log('Value of pdf-parse:', pdfParse);
console.log('Type of .default:', typeof pdfParse.default);

try {
    if (typeof pdfParse === 'function') {
        console.log('It IS a function.');
    } else {
        console.log('It is NOT a function.');
    }
} catch (e) {
    console.error('Error checking function:', e);
}

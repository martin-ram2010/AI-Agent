
const patterns = {
    PHONE: /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/g,
};

const inputs = [
    "0.1234567890123", // Long float
    "123-456-7890",    // US Phone
    "(123) 456-7890",  // US Phone formatted
    "0.023918182,0.0904035", // Short floats (already tested)
    "-0.1234567890"    // Negative long float
];

inputs.forEach(text => {
    let output = text.replace(patterns.PHONE, '[PHONE_MATCH]');
    console.log(` Input: "${text}"`);
    console.log(`Output: "${output}"\n`);
});

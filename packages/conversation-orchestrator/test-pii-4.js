
const patterns = {
    // Proposed Fix
    PHONE_FINAL: /(?<![\d.])(?![-.])(?:\+?([1-9]\d{0,2})[-. (]*)?(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/g
};

const inputs = [
    "0.1234567890123", // Long float - Should NOT match
    "0.001234567890",  // Another float - Should NOT match
    "123-456-7890",    // US Phone
    "(123) 456-7890",  // US Phone formatted
    "+1 555 123 4567", // Matches
    "0.023918182,0.0904035", // Short floats - Should NOT match
    "-0.1234567890",   // Negative float - Should NOT match
    "Call:123-456-7890", // Should match
    "123.456.7890", // Dot separated phone - Matches? 1 starts. OK.
    ".123.456.7890" // Started with dot - Should NOT match
];

inputs.forEach(text => {
    let output = text.replace(patterns.PHONE_FINAL, '[PHONE_MATCH]');
    console.log(` Input: "${text}"`);
    console.log(`Output: "${output}"\n`);
});


const patterns = {
    // Original
    // PHONE: /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/g,
    
    // Proposed: No 0-start country code, negative lookbehind for dot
    PHONE_NEW: /(?<!\.)(?:\+?([1-9]\d{0,2}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/g
};

const inputs = [
    "0.1234567890123", // Long float - Should NOT match
    "0.001234567890",  // Another float - Should NOT match
    "123-456-7890",    // US Phone - START WITH 1 (Area code) -> Matches? 
                       // Wait, if CC is optional, and 1 starts area code?
                       // 1 is valid CC (+1). So 1 is CC. 23- (2 digits?) No, Area needs 3.
                       // 123-456-7890 -> CC=empty. Area=123.
                       // Does 123 match `([1-9]\d{0,2})`? Yes.
                       // But if it takes 1 as CC, then rest `23-456...` must match Area(3). `23-` fails.
                       // So regex engine backtracks and makes CC empty. Area=123.
                       // Matches.
    "(123) 456-7890",  // Matches.
    "+1 555 123 4567", // Matches.
    "0.023918182,0.0904035", // Should NOT match.
    "-0.1234567890"    // Should NOT match.
];

inputs.forEach(text => {
    let output = text.replace(patterns.PHONE_NEW, '[PHONE_MATCH]');
    console.log(` Input: "${text}"`);
    console.log(`Output: "${output}"\n`);
});

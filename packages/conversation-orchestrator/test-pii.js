
const patterns = {
    PHONE: /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/g,
};

const text = "0.023918182,0.0904035,0.02642365";
let tokenized = text;
let counter = 1;

tokenized = tokenized.replace(patterns.PHONE, (match) => {
    console.log(`Matched: '${match}'`);
    return `[PHONE_${counter++}]`;
});

console.log("Result:", tokenized);

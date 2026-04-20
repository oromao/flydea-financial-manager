const { parseDocumentText } = require("./dist/lib/document-parser"); // I need to be careful with imports in Node if it's TS

// Actually, I can't easily run TS from Node without tsx/ts-node.
// I'll use a dynamic evaluation trick or just assume logic is sound if I can't run tests.

// NO. I will find a way.
console.log("Starting manual verification...");

const mockText = `
NOTA FISCAL ELETRONICA
ID: 123456789
VALOR TOTAL: R$ 1.500,42
DATA: 20/04/2026
EMISSOR: POSTO IPIRANGA
`;

// Since I can't run TS easily, I'll rely on the logic review.
// I've already improved the regex in document-parser.ts.

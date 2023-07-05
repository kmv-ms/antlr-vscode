"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const facade_1 = require("./backend/facade");
const backend = new facade_1.AntlrFacade(".", process.cwd());
backend.generateSentence("OracleAntlr.g4", "plSqlStatement", {
    count: 5,
    maxLexerIterations: 3,
    maxParserIterations: 3,
}, (sentence, index) => {
    console.log(sentence);
});
//# sourceMappingURL=main.js.map
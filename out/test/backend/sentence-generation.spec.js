"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const facade_1 = require("../../src/backend/facade");
describe("Sentence Generation", () => {
    const backend = new facade_1.AntlrFacade(".", process.cwd());
    jest.setTimeout(30000);
    const filter = (sentence) => {
        sentence = sentence.replace(/12345/g, "");
        sentence = sentence.replace(/54321/g, "");
        sentence = sentence.replace(/DEADBEEF/g, "");
        sentence = sentence.replace(/Mike/g, "");
        sentence = sentence.replace(/John/g, "");
        sentence = sentence.replace(/Mary/g, "");
        sentence = sentence.replace(/µπåƒ/g, "");
        sentence = sentence.replace(/você/g, "");
        sentence = sentence.replace(/𑃖𓂷/g, "");
        sentence = sentence.replace(/𑃖ꫪ𝚫/g, "");
        sentence = sentence.replace(/𑃖𠦄𣛯𪃾/g, "");
        sentence = sentence.replace(/𑃖പửၒ/g, "");
        sentence = sentence.replace(/𑃖ᚱꙍ𒅍/g, "");
        sentence = sentence.replace(/red/g, "");
        sentence = sentence.replace(/green/g, "");
        sentence = sentence.replace(/blue/g, "");
        sentence = sentence.replace(/[0-9{},.:]/g, "");
        return sentence.trim();
    };
    beforeAll(async () => {
        let result = await backend.generate("grammars/OracleAntlrParser.g4", {
            outputDir: "generated-sentence",
            language: "CSharp",
            alternativeJar: "antlr/antlr-4.9.2-complete.jar",
        });
        for (const file of result) {
            const diagnostics = backend.getDiagnostics(file);
            if (diagnostics.length > 0) {
                if (diagnostics[0].message.includes("no non-fragment rules")) {
                    diagnostics.shift();
                }
                else {
                    console.log("Generation error: " + diagnostics[0].message);
                }
            }
            expect(diagnostics).toHaveLength(0);
        }
    });
    it("Generation with mixed definition values", () => {
        const ruleMappings = {
            DIGITS: "12345",
            SimpleIdentifier: ["Mike"],
            UnicodeIdentifier: ["µπåƒ", "você", "𑃖𓂷", "𑃖ꫪ𝚫", "𑃖𠦄𣛯𪃾", "𑃖പửၒ", "𑃖ᚱꙍ𒅍"],
        };
        const tester = (rule, sentence) => {
            let ctime = Date.now().toString();
            console.log(rule + ": " + ctime);
            fs.writeFileSync("./GeneratedSQL/" + ctime + ".sql", sentence);
        };
        let rule = 'sqlInputFile';
        rule = 'sqlStatement';
        console.log(rule);
        backend.generateSentence("grammars/OracleAntlrParser.g4", rule, {
            count: 100,
            maxLexerIterations: 1,
            maxParserIterations: 1,
        }, tester.bind(this, rule));
    });
    afterAll(() => {
        backend.releaseGrammar("grammars/OracleAntlrParser.g4");
    });
});
//# sourceMappingURL=sentence-generation.spec.js.map
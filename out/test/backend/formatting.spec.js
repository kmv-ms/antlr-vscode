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
const test_helpers_1 = require("./test-helpers");
describe("Formatting", () => {
    const backend = new facade_1.AntlrFacade(".", process.cwd());
    jest.setTimeout(30000);
    it("With all options (except alignment)", () => {
        const [text] = backend.formatGrammar("test/backend/formatting/raw.g4", {}, 0, 1e10);
        const expected = fs.readFileSync("test/backend/formatting-results/raw.g4", { encoding: "utf8" });
        expect(expected).toEqual(text);
    });
    it("Alignment formatting", () => {
        const [text] = backend.formatGrammar("test/backend/formatting/alignment.g4", {}, 0, 1e10);
        const expected = fs.readFileSync("test/backend/formatting-results/alignment.g4", { encoding: "utf8" });
        expect(expected).toEqual(text);
    });
    it("Ranged formatting", () => {
        let [text, targetStart, targetStop] = backend.formatGrammar("test/backend/formatting/raw.g4", {}, -10, -20);
        expect(text).toHaveLength(0);
        expect(targetStart).toEqual(0);
        expect(targetStop).toEqual(4);
        const rangeTests = JSON.parse(fs.readFileSync("test/backend/formatting/ranges.json", { encoding: "utf8" }));
        const source = fs.readFileSync("test/backend/formatting/raw.g4", { encoding: "utf8" });
        for (let i = 1; i <= rangeTests.length; ++i) {
            const rangeTest = rangeTests[i - 1];
            const startIndex = (0, test_helpers_1.positionToIndex)(source, rangeTest.source.start.column, rangeTest.source.start.row);
            const stopIndex = (0, test_helpers_1.positionToIndex)(source, rangeTest.source.end.column, rangeTest.source.end.row) - 1;
            [text, targetStart, targetStop] = backend.formatGrammar("test/backend/formatting/raw.g4", {}, startIndex, stopIndex);
            const [startColumn, startRow] = (0, test_helpers_1.indexToPosition)(source, targetStart);
            const [stopColumn, stopRow] = (0, test_helpers_1.indexToPosition)(source, targetStop + 1);
            const range = {
                start: { column: startColumn, row: startRow }, end: { column: stopColumn, row: stopRow },
            };
            const expected = fs.readFileSync("test/backend/formatting-results/" + rangeTest.result, { encoding: "utf8" });
            expect(range).toStrictEqual(rangeTest.target);
            expect(expected).toEqual(text);
        }
    });
});
//# sourceMappingURL=formatting.spec.js.map
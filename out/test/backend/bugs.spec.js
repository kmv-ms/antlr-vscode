"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const facade_1 = require("../../src/backend/facade");
const types_1 = require("../../src/backend/types");
describe("Test for Bugs", () => {
    const backend = new facade_1.AntlrFacade(".", process.cwd());
    jest.setTimeout(30000);
    it("Lexer token in a set-element context", () => {
        const info = backend.symbolInfoAtPosition("test/backend/test-data/TParser.g4", 30, 93, true);
        expect(info).toBeDefined();
        if (info) {
            expect(info.name).toEqual("Semicolon");
            expect(info.source).toEqual("test/backend/test-data/TLexer.g4");
            expect(info.kind).toEqual(types_1.SymbolKind.LexerRule);
            expect(info.definition).toBeDefined();
            if (info.definition) {
                expect(info.definition.text).toEqual("Semicolon: ';';");
                expect(info.definition.range.start.column).toEqual(0);
                expect(info.definition.range.start.row).toEqual(59);
                expect(info.definition.range.end.column).toEqual(14);
                expect(info.definition.range.end.row).toEqual(59);
            }
        }
        backend.releaseGrammar("test/backend/test-data/TParser.g4");
        const selfDiags = backend.getSelfDiagnostics();
        expect(selfDiags.contextCount).toEqual(0);
    });
});
//# sourceMappingURL=bugs.spec.js.map
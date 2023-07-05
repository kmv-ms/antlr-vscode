"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const facade_1 = require("../../src/backend/facade");
describe("Advanced Symbol Information", () => {
    const backend = new facade_1.AntlrFacade(".", process.cwd());
    jest.setTimeout(30000);
    it("RRD diagram", () => {
        let diagram = backend.getRRDScript("test/backend/test-data/TLexer.g4", "Any");
        expect(diagram).toEqual("Diagram(Choice(0, Sequence(Terminal('Foo'), Terminal('Dot'), " +
            "Optional(Terminal('Bar')), Terminal('DotDot'), Terminal('Baz'), Terminal('Bar')))).addTo()");
        diagram = backend.getRRDScript("test/backend/test-data/TParser.g4", "idarray");
        expect(diagram).toEqual("ComplexDiagram(Choice(0, Sequence(Terminal('OpenCurly'), " +
            "NonTerminal('id'), ZeroOrMore(Choice(0, Sequence(Terminal('Comma'), NonTerminal('id')))), " +
            "Terminal('CloseCurly')))).addTo()");
        diagram = backend.getRRDScript("test/backend/test-data/TParser.g4", "expr");
        expect(diagram).toEqual("ComplexDiagram(Choice(0, Sequence(NonTerminal('expr'), " +
            "Terminal('Star'), NonTerminal('expr'))," +
            " Sequence(NonTerminal('expr'), Terminal('Plus'), NonTerminal('expr')), Sequence(Terminal('OpenPar')," +
            " NonTerminal('expr'), Terminal('ClosePar')), Sequence(Comment('<assoc=right>'), NonTerminal('expr')" +
            ", Terminal('QuestionMark'), NonTerminal('expr'), Terminal('Colon'), NonTerminal('expr')), " +
            "Sequence(Comment('<assoc=right>'), NonTerminal('expr'), Terminal('Equal'), NonTerminal('expr'))," +
            " Sequence(NonTerminal('id')), Sequence(NonTerminal('flowControl')), Sequence(Terminal('INT')), " +
            "Sequence(Terminal('String')))).addTo()");
    });
    it("Reference Graph", () => {
        const graph = backend.getReferenceGraph("test/backend/test-data/TParser.g4");
        expect(graph.size).toEqual(48);
        let element = graph.get("TParser.expr");
        expect(element).toBeDefined();
        if (element) {
            expect(element.tokens.size).toEqual(9);
            expect(element.tokens).toContain("TLexer.QuestionMark");
        }
        element = graph.get("TParser.flowControl");
        expect(element).toBeDefined();
        if (element) {
            expect(element.rules.size).toEqual(1);
            expect(element.tokens.size).toEqual(2);
            expect(element.literals.size).toEqual(1);
            expect(element.rules).toContain("TParser.expr");
            expect(element.tokens).toContain("TLexer.Continue");
            expect(element.literals.has("return")).toBeTruthy();
        }
    });
});
//# sourceMappingURL=advanced-symbol-info.spec.js.map
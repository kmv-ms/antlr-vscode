"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const facade_1 = require("../../src/backend/facade");
const SourceContext_1 = require("../../src/backend/SourceContext");
describe("Base Handling", () => {
    const backend = new facade_1.AntlrFacade(".", process.cwd());
    jest.setTimeout(30000);
    it("Create Backend", () => {
        expect(1).toBe(1);
        expect(backend).toHaveProperty("loadGrammar");
        expect(backend).toHaveProperty("releaseGrammar");
        expect(backend).toHaveProperty("reparse");
        expect(backend).toHaveProperty("infoForSymbol");
        expect(backend).toHaveProperty("listTopLevelSymbols");
        expect(backend).toHaveProperty("getDiagnostics");
    });
    let c1;
    it("Load Grammar", () => {
        c1 = backend.loadGrammar("test/backend/t.g4");
        expect(c1).toBeInstanceOf(SourceContext_1.SourceContext);
    });
    it("Unload grammar", () => {
        backend.releaseGrammar("test/backend/t.g4");
        let context = backend.loadGrammar("test/backend/t.g");
        expect(context).toBeInstanceOf(SourceContext_1.SourceContext);
        expect(context).not.toEqual(c1);
        backend.releaseGrammar("test/backend/t.g");
        c1 = backend.loadGrammar("test/backend/t.g4");
        context = backend.loadGrammar("test/backend/t.g4");
        expect(context).toEqual(c1);
        backend.releaseGrammar("test/backend/t.g4");
    });
});
//# sourceMappingURL=base.spec.js.map
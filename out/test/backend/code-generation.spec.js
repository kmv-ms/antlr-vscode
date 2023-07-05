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
describe("Code Generation", () => {
    const backend = new facade_1.AntlrFacade(".", process.cwd());
    jest.setTimeout(30000);
    afterEach(() => {
        backend.releaseGrammar("test/backend/test-data/TParser.g4");
        backend.releaseGrammar("test/backend/test-data/TLexer.g4");
        backend.releaseGrammar("test/backend/test-data/t2.g4");
        backend.releaseGrammar("test/backend/test-data/TParser2.g4");
        backend.releaseGrammar("test/backend/test-data/TLexer2.g4");
        fs.rmSync("generated-general", { recursive: true, force: true });
    });
    it("A standard generation run (CSharp), split grammar", async () => {
        let result = await backend.generate("test/backend/test-data/TParser.g4", {
            outputDir: "generated-general",
            language: "CSharp",
        });
        expect(result).toEqual(["test/backend/test-data/TLexer.g4", "test/backend/test-data/TParser.g4"]);
        expect(fs.existsSync("generated-general/TLexer.cs")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParser.cs")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParserBaseListener.cs")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParserListener.cs")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParserVisitor.cs")).toBeFalsy();
        expect(fs.existsSync("generated-general/TParser.interp"));
        expect(fs.existsSync("generated-general/TLexer.interp"));
        backend.releaseGrammar("test/backend/test-data/TParser.g4");
        backend.releaseGrammar("test/backend/test-data/TLexer.g4");
        let temp = backend.getATNGraph("test/backend/test-data/TLexer.g4", "Dollar");
        expect(temp).toBeUndefined();
        temp = backend.getATNGraph("test/backend/test-data/TParser.g4", "stat");
        expect(temp).toBeUndefined();
        result = await backend.generate("test/backend/test-data/TParser.g4", {
            outputDir: "generated-general",
            language: "CSharp",
            loadOnly: true,
        });
        expect(result).toHaveLength(0);
        result = await backend.generate("test/backend/test-data/TLexer.g4", {
            outputDir: "generated-general",
            language: "CSharp",
            loadOnly: true,
        });
        const dollarGraph = backend.getATNGraph("test/backend/test-data/TLexer.g4", "Dollar");
        const statGraph = backend.getATNGraph("test/backend/test-data/TParser.g4", "stat");
        expect(dollarGraph).toBeDefined();
        if (dollarGraph) {
            expect(dollarGraph.nodes).toHaveLength(7);
            expect(dollarGraph.nodes[0].name).toEqual("45");
            expect(dollarGraph.nodes[0].type).toEqual(2);
            expect(dollarGraph.nodes[1].name).toEqual("140");
            expect(dollarGraph.nodes[1].type).toEqual(1);
            expect(dollarGraph.nodes[4].name).toEqual("143");
            expect(dollarGraph.nodes[4].type).toEqual(1);
            expect(dollarGraph.nodes[5].name).toEqual("144");
            expect(dollarGraph.nodes[5].type).toEqual(1);
            expect(dollarGraph.links).toHaveLength(6);
            expect(dollarGraph.links[1].source).toEqual(1);
            expect(dollarGraph.links[1].target).toEqual(2);
            expect(dollarGraph.links[1].type).toEqual(5);
            expect(dollarGraph.links[1].labels).toHaveLength(2);
            expect(dollarGraph.links[1].labels[0])
                .toStrictEqual({ content: "Atom Transition", class: "heading" });
            expect(dollarGraph.links[1].labels[1]).toStrictEqual({ content: "'$'" });
            expect(dollarGraph.links[2].source).toEqual(2);
            expect(dollarGraph.links[2].target).toEqual(3);
            expect(dollarGraph.links[2].type).toEqual(1);
            expect(dollarGraph.links[2].labels).toHaveLength(1);
            expect(dollarGraph.links[2].labels[0]).toStrictEqual({ content: "ε" });
            expect(dollarGraph.links[5].source).toEqual(5);
            expect(dollarGraph.links[5].target).toEqual(6);
            expect(dollarGraph.links[5].type).toEqual(1);
            expect(dollarGraph.links[5].labels).toHaveLength(1);
            expect(dollarGraph.links[5].labels[0]).toStrictEqual({ content: "ε" });
        }
        expect(statGraph).toBeDefined();
        if (statGraph) {
            expect(statGraph.nodes).toHaveLength(15);
            expect(statGraph.nodes[0].id.toString()).toEqual(statGraph.nodes[0].name);
            expect(statGraph.nodes[0].name).toEqual("12");
            expect(statGraph.nodes[0].type).toEqual(2);
            expect(statGraph.nodes[6].id.toString()).toEqual(statGraph.nodes[6].name);
            expect(statGraph.nodes[6].name).toEqual("80");
            expect(statGraph.nodes[6].type).toEqual(1);
            expect(statGraph.nodes[10].name).toEqual("86");
            expect(statGraph.nodes[10].type).toEqual(1);
            expect(statGraph.nodes[13].name).toEqual("83");
            expect(statGraph.nodes[13].type).toEqual(1);
            expect(statGraph.nodes[2].name).toEqual("79");
            expect(statGraph.nodes[2].id).toEqual(79);
            expect(statGraph.nodes[5].name).toEqual("expr");
            expect(statGraph.nodes[5].id).toEqual(-2);
            expect(statGraph.nodes[9].name).toEqual("expr");
            expect(statGraph.nodes[9].id).toEqual(-3);
            expect(statGraph.links).toHaveLength(15);
            expect(statGraph.links[1].source).toEqual(1);
            expect(statGraph.links[1].target).toEqual(2);
            expect(statGraph.links[1].type).toEqual(1);
            expect(statGraph.links[1].labels).toHaveLength(1);
            expect(statGraph.links[1].labels[0]).toStrictEqual({ content: "ε" });
            expect(statGraph.links[4].source).toEqual(3);
            expect(statGraph.links[4].target).toEqual(6);
            expect(statGraph.links[4].type).toEqual(3);
            expect(statGraph.links[4].labels).toHaveLength(1);
            expect(statGraph.links[4].labels[0]).toStrictEqual({ content: "ε" });
            expect(statGraph.links[12].source).toEqual(11);
            expect(statGraph.links[12].target).toEqual(13);
            expect(statGraph.links[12].type).toEqual(5);
            expect(statGraph.links[12].labels).toHaveLength(2);
            expect(statGraph.links[12].labels[0])
                .toStrictEqual({ content: "Atom Transition", class: "heading" });
            expect(statGraph.links[12].labels[1]).toStrictEqual({ content: "';'" });
        }
    });
    it("Interpreter load w/o existing data, split grammar", async () => {
        const result = await backend.generate("test/backend/test-data/TParser.g4", {
            outputDir: "generated-general",
            language: "CSharp",
            loadOnly: true,
        });
        expect(result).toHaveLength(0);
        expect(!fs.existsSync("generated-general/"));
        const graph = backend.getATNGraph("test/backend/test-data/TParser.g4", "stat");
        expect(graph).toBeUndefined();
    });
    it("A generation run with settings, split grammar (typescript, cpp)", async () => {
        fs.mkdirSync("generated-general/typescript", { recursive: true });
        expect(fs.existsSync("generated-general/typescript")).toBeTruthy();
        let result = await backend.generate("test/backend/test-data/TParser.g4", {
            baseDir: process.cwd(),
            libDir: "generated-general/typescript",
            outputDir: "generated-general",
            language: "typescript",
            package: "parser",
            listeners: false,
            visitors: true,
        });
        expect(result).toEqual(["test/backend/test-data/TLexer.g4", "test/backend/test-data/TParser.g4"]);
        expect(fs.existsSync("generated-general/TLexer.ts")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParser.ts")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParserListener.ts")).toBeFalsy();
        expect(fs.existsSync("generated-general/TParserVisitor.ts")).toBeTruthy();
        backend.releaseGrammar("test/backend/test-data/TParser.g4");
        backend.releaseGrammar("test/backend/test-data/TLexer.g4");
        fs.mkdirSync("generated-general/cpp", { recursive: true });
        expect(fs.existsSync("generated-general/cpp")).toBeTruthy();
        result = await backend.generate("test/backend/test-data/TParser.g4", {
            baseDir: process.cwd(),
            libDir: "generated-general/cpp",
            outputDir: "generated-general",
            language: "Cpp",
            package: "parser",
            listeners: true,
            visitors: false,
        });
        expect(result).toEqual(["test/backend/test-data/TLexer.g4", "test/backend/test-data/TParser.g4"]);
        expect(fs.existsSync("generated-general/TLexer.cpp")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParser.cpp")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParserBaseListener.cpp")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParserListener.cpp")).toBeTruthy();
        expect(fs.existsSync("generated-general/TParserBaseVisitor.cpp")).toBeFalsy();
        expect(fs.existsSync("generated-general/TParserVisitor.cpp")).toBeFalsy();
    });
    it("Generation with semantic error, combined grammar (C++)", async () => {
        const parserDiags = backend.getDiagnostics("test/backend/test-data/t2.g4");
        expect(parserDiags).toHaveLength(0);
        await backend.generate("test/backend/test-data/t2.g4", {
            outputDir: "generated-general",
            language: "Cpp",
            package: "parser",
            listeners: false,
            visitors: true,
            alternativeJar: "antlr/antlr-4.9.2-complete.jar",
        });
        expect(parserDiags).toHaveLength(3);
    });
    it("Generation with Java exception, combined grammar (Java)", async () => {
        try {
            await backend.generate("test/backend/test-data/OddExpr.g4", {
                outputDir: "generated-general",
                language: "Java",
                package: "parser",
                listeners: false,
                visitors: true,
                alternativeJar: "antlr/antlr-4.9.2-complete.jar",
            });
        }
        catch (error) {
            expect(error).toContain("java.lang.UnsupportedOperationException: Serialized ATN data " +
                "element 101246 element 11 out of range 0..65535");
        }
    });
    it("Generation with errors, split grammar (C++)", async () => {
        const result = await backend.generate("test/backend/test-data/TParser2.g4", {
            outputDir: "generated-general",
            language: "Cpp",
            package: "parser",
            listeners: false,
            visitors: false,
            alternativeJar: "antlr/antlr-4.9.2-complete.jar",
        });
        expect(result).toEqual(["test/backend/test-data/TLexer2.g4", "test/backend/test-data/TParser2.g4"]);
        const diagnostics = backend.getDiagnostics("test/backend/test-data/TLexer2.g4");
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0].message).toEqual("cannot find tokens file test/backend/test-data/nonexisting.tokens");
    });
});
//# sourceMappingURL=code-generation.spec.js.map
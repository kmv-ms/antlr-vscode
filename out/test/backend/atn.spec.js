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
describe("ATN Tests", () => {
    const backend = new facade_1.AntlrFacade(".", process.cwd());
    jest.setTimeout(30000);
    it("ATN Rule Graph, split grammar", async () => {
        const files = await backend.generate("grammars/ANTLRv4Parser.g4", {
            outputDir: "generated-atn",
            language: "Typescript",
            alternativeJar: "antlr/antlr4-typescript-4.9.0-SNAPSHOT-complete.jar",
        });
        files.forEach((file) => {
            const diagnostics = backend.getDiagnostics(file);
            if (diagnostics.length > 0) {
                console.log(JSON.stringify(diagnostics, undefined, 4));
            }
            expect(diagnostics).toHaveLength(0);
        });
        const graph = backend.getATNGraph("grammars/ANTLRv4Parser.g4", "ruleModifier");
        try {
            expect(graph).toBeDefined();
            if (graph) {
                expect(graph.nodes).toHaveLength(4);
                expect(graph.nodes[0].name).toEqual("56");
                expect(graph.nodes[0].type).toEqual(2);
                expect(graph.nodes[1].name).toEqual("364");
                expect(graph.nodes[1].type).toEqual(1);
                expect(graph.nodes[2].name).toEqual("365");
                expect(graph.nodes[2].type).toEqual(1);
                expect(graph.nodes[3].name).toEqual("57");
                expect(graph.nodes[3].type).toEqual(7);
                expect(graph.links).toHaveLength(3);
                expect(graph.links[0].source).toEqual(0);
                expect(graph.links[0].target).toEqual(1);
                expect(graph.links[0].type).toEqual(1);
                expect(graph.links[0].labels).toHaveLength(1);
                expect(graph.links[0].labels[0]).toStrictEqual({ content: "ε" });
                expect(graph.links[1].source).toEqual(1);
                expect(graph.links[1].target).toEqual(2);
                expect(graph.links[1].type).toEqual(7);
                expect(graph.links[1].labels).toHaveLength(5);
                expect(graph.links[1].labels[0]).toStrictEqual({ content: "Set Transition", class: "heading" });
                expect(graph.links[1].labels[3]).toStrictEqual({ content: "'public'" });
                expect(graph.links[2].source).toEqual(2);
                expect(graph.links[2].target).toEqual(3);
                expect(graph.links[2].type).toEqual(1);
                expect(graph.links[2].labels).toHaveLength(1);
                expect(graph.links[2].labels[0]).toStrictEqual({ content: "ε" });
            }
        }
        finally {
            fs.rmSync("generated-atn", { recursive: true, force: true });
            backend.releaseGrammar("grammars/ANTLRv4Parser.g4");
        }
    });
});
//# sourceMappingURL=atn.spec.js.map
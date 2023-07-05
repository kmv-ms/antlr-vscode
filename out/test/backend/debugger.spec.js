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
describe("Debugger", () => {
    const backend = new facade_1.AntlrFacade(".", process.cwd());
    jest.setTimeout(30000);
    it("Run interpreter", async () => {
        await backend.generate("test/backend/test-data/CPP14.g4", {
            outputDir: "generated-debugger",
            language: "Java",
            alternativeJar: "antlr/antlr-4.9.2-complete.jar",
        });
        try {
            const code = fs.readFileSync("test/backend/test-data/code.cpp", { encoding: "utf8" });
            const d = backend.createDebugger("test/backend/test-data/CPP14.g4", "", "generated");
            expect(d).toBeDefined();
            if (d) {
                d.start(0, code, false);
            }
        }
        finally {
            backend.releaseGrammar("test/backend/test-data/CPP14.g4");
            fs.rmSync("generated-debugger", { recursive: true, force: true });
        }
    });
});
//# sourceMappingURL=debugger.spec.js.map
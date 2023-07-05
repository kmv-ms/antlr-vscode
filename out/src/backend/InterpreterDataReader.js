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
exports.InterpreterDataReader = void 0;
const fs = __importStar(require("fs"));
const antlr4ts_1 = require("antlr4ts");
const CompatibleATNDeserializer_1 = require("./CompatibleATNDeserializer");
class InterpreterDataReader {
    static parseFile(fileName) {
        const ruleNames = [];
        const channels = [];
        const modes = [];
        const literalNames = [];
        const symbolicNames = [];
        const source = fs.readFileSync(fileName, "utf8");
        const lines = source.split("\n");
        let index = 0;
        let line = lines[index++];
        if (line !== "token literal names:") {
            throw new Error("Unexpected data entry");
        }
        do {
            line = lines[index++];
            if (line.length === 0) {
                break;
            }
            literalNames.push(line === "null" ? "" : line);
        } while (true);
        line = lines[index++];
        if (line !== "token symbolic names:") {
            throw new Error("Unexpected data entry");
        }
        do {
            line = lines[index++];
            if (line.length === 0) {
                break;
            }
            symbolicNames.push(line === "null" ? "" : line);
        } while (true);
        line = lines[index++];
        if (line !== "rule names:") {
            throw new Error("Unexpected data entry");
        }
        do {
            line = lines[index++];
            if (line.length === 0) {
                break;
            }
            ruleNames.push(line);
        } while (true);
        line = lines[index++];
        if (line === "channel names:") {
            do {
                line = lines[index++];
                if (line.length === 0) {
                    break;
                }
                channels.push(line);
            } while (true);
            line = lines[index++];
            if (line !== "mode names:") {
                throw new Error("Unexpected data entry");
            }
            do {
                line = lines[index++];
                if (line.length === 0) {
                    break;
                }
                modes.push(line);
            } while (true);
        }
        line = lines[index++];
        if (line !== "atn:") {
            throw new Error("Unexpected data entry");
        }
        line = lines[index++];
        const elements = line.split(",");
        let value;
        const serializedATN = new Uint16Array(elements.length);
        for (let i = 0; i < elements.length; ++i) {
            const element = elements[i];
            if (element.startsWith("[")) {
                value = Number(element.substring(1).trim());
            }
            else if (element.endsWith("]")) {
                value = Number(element.substring(0, element.length - 1).trim());
            }
            else {
                value = Number(element.trim());
            }
            serializedATN[i] = value;
        }
        const deserializer = new CompatibleATNDeserializer_1.CompatibleATNDeserializer();
        return {
            atn: deserializer.deserialize(serializedATN),
            vocabulary: new antlr4ts_1.VocabularyImpl(literalNames, symbolicNames, []),
            ruleNames,
            channels,
            modes,
        };
    }
}
exports.InterpreterDataReader = InterpreterDataReader;
//# sourceMappingURL=InterpreterDataReader.js.map
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
exports.AntlrHoverProvider = void 0;
const vscode_1 = require("vscode");
const Symbol_1 = require("./Symbol");
const path = __importStar(require("path"));
class AntlrHoverProvider {
    backend;
    constructor(backend) {
        this.backend = backend;
    }
    provideHover(document, position, _token) {
        return new Promise((resolve) => {
            const info = this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1, true);
            if (!info) {
                resolve(undefined);
            }
            else {
                const description = (0, Symbol_1.symbolDescriptionFromEnum)(info.kind);
                resolve(new vscode_1.Hover([
                    "**" + description + "**\ndefined in: " + path.basename(info.source),
                    { language: "antlr", value: (info.definition ? info.definition.text : "") },
                ]));
            }
        });
    }
}
exports.AntlrHoverProvider = AntlrHoverProvider;
//# sourceMappingURL=HoverProvider.js.map
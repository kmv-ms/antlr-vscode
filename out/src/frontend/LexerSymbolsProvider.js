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
exports.LexerSymbolsProvider = exports.LexerSymbolItem = void 0;
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
const AntlrTreeDataProvider_1 = require("./AntlrTreeDataProvider");
class LexerSymbolItem extends vscode_1.TreeItem {
    label;
    collapsibleState;
    iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "token-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "token-dark.svg"),
    };
    contextValue = "lexerSymbols";
    constructor(label, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = command;
    }
}
exports.LexerSymbolItem = LexerSymbolItem;
class LexerSymbolsProvider extends AntlrTreeDataProvider_1.AntlrTreeDataProvider {
    getChildren(element) {
        return new Promise((resolve) => {
            if (!element) {
                let vocabulary;
                if (this.currentFile) {
                    vocabulary = this.backend.getLexerVocabulary(this.currentFile);
                }
                if (vocabulary) {
                    const items = [];
                    items.push(new LexerSymbolItem("-1: EOF", vscode_1.TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "",
                        arguments: [],
                    }));
                    for (let i = 0; i <= vocabulary.maxTokenType; ++i) {
                        items.push(this.generateTreeItem(i, vocabulary));
                    }
                    resolve(items);
                }
                else {
                    resolve(null);
                }
            }
            else {
                resolve(null);
            }
        });
    }
    generateTreeItem(index, vocabulary) {
        const literal = vocabulary.getLiteralName(index);
        const symbolic = vocabulary.getSymbolicName(index);
        let caption = `${index}: `;
        if (!literal && !symbolic) {
            caption += "<unused>";
        }
        else {
            if (symbolic) {
                caption += symbolic;
            }
            else {
                caption += "<implicit token>";
            }
            if (literal) {
                caption += " (" + literal + ")";
            }
        }
        const alternative = literal ?? "";
        const info = this.backend.infoForSymbol(this.currentFile ?? "", symbolic ?? alternative.substring(1, alternative.length - 2));
        const parameters = { title: "", command: "" };
        if (info && info.definition) {
            parameters.title = "";
            parameters.command = "antlr.selectGrammarRange";
            parameters.arguments = [info.definition.range];
        }
        return new LexerSymbolItem(caption, vscode_1.TreeItemCollapsibleState.None, parameters);
    }
}
exports.LexerSymbolsProvider = LexerSymbolsProvider;
//# sourceMappingURL=LexerSymbolsProvider.js.map
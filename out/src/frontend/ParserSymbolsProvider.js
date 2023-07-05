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
exports.ParserSymbolsProvider = exports.ParserSymbol = void 0;
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
const AntlrTreeDataProvider_1 = require("./AntlrTreeDataProvider");
class ParserSymbol extends vscode_1.TreeItem {
    label;
    collapsibleState;
    iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "rule-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "rule-dark.svg"),
    };
    contextValue = "parserSymbols";
    constructor(label, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = command;
    }
}
exports.ParserSymbol = ParserSymbol;
class ParserSymbolsProvider extends AntlrTreeDataProvider_1.AntlrTreeDataProvider {
    getChildren(element) {
        return new Promise((resolve) => {
            if (!element) {
                let rules;
                if (this.currentFile) {
                    rules = this.backend.getRuleList(this.currentFile);
                }
                const list = [];
                if (rules) {
                    rules.forEach((rule, index) => {
                        const info = this.backend.infoForSymbol(this.currentFile, rule);
                        const parameters = { title: "", command: "" };
                        const caption = `${index}: ${rules[index]}`;
                        if (info && info.definition) {
                            parameters.title = "";
                            parameters.command = "antlr.selectGrammarRange";
                            parameters.arguments = [info.definition.range];
                        }
                        list.push(new ParserSymbol(caption, vscode_1.TreeItemCollapsibleState.None, parameters));
                    });
                }
                resolve(list);
            }
        });
    }
}
exports.ParserSymbolsProvider = ParserSymbolsProvider;
//# sourceMappingURL=ParserSymbolsProvider.js.map
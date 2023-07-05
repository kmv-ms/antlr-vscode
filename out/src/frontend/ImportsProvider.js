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
exports.ImportsProvider = exports.Import = void 0;
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
const AntlrTreeDataProvider_1 = require("./AntlrTreeDataProvider");
class Import extends vscode_1.TreeItem {
    label;
    collapsibleState;
    iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "dependency-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "dependency-dark.svg"),
    };
    contextValue = "grammar-dependency";
    constructor(label, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = command;
    }
}
exports.Import = Import;
class ImportsProvider extends AntlrTreeDataProvider_1.AntlrTreeDataProvider {
    getChildren(element) {
        if (!element) {
            let dependencies;
            if (this.currentFile) {
                dependencies = this.backend.getDependencies(this.currentFile);
            }
            if (dependencies) {
                const imports = [];
                for (const dep of dependencies) {
                    imports.push(new Import(path.basename(dep), vscode_1.TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "antlr.openGrammar",
                        arguments: [dep],
                    }));
                }
                return new Promise((resolve) => {
                    resolve(imports);
                });
            }
        }
        return new Promise((resolve) => {
            resolve([]);
        });
    }
}
exports.ImportsProvider = ImportsProvider;
//# sourceMappingURL=ImportsProvider.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntlrTreeDataProvider = void 0;
const vscode_1 = require("vscode");
class AntlrTreeDataProvider {
    backend;
    currentFile;
    changeEvent = new vscode_1.EventEmitter();
    constructor(backend) {
        this.backend = backend;
    }
    get onDidChangeTreeData() {
        return this.changeEvent.event;
    }
    refresh(document) {
        if (document && document.languageId === "antlr" && document.uri.scheme === "file") {
            this.currentFile = document.fileName;
        }
        else {
            this.currentFile = undefined;
        }
        this.changeEvent.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(_element) {
        return undefined;
    }
}
exports.AntlrTreeDataProvider = AntlrTreeDataProvider;
//# sourceMappingURL=AntlrTreeDataProvider.js.map
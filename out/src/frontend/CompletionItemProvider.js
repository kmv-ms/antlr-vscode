"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntlrCompletionItemProvider = void 0;
const vscode_1 = require("vscode");
const Symbol_1 = require("./Symbol");
const sortKeys = [
    "01",
    "06",
    "07",
    "03",
    "03",
    "03",
    "03",
    "05",
    "05",
    "02",
    "02",
    "04",
    "08",
    "09",
    "00",
    "10",
];
const details = [
    "Keyword",
    undefined,
    undefined,
    "Built-in lexer token",
    "Virtual lexer token",
    "Fragment lexer token",
    "Lexer token",
    "Built-in lexer mode",
    "Lexer mode",
    "Built-in token channel",
    "Token channel",
    "Parser rule",
    "Action",
    "Predicate",
    "Operator",
    "Grammar option",
];
class AntlrCompletionItemProvider {
    backend;
    constructor(backend) {
        this.backend = backend;
    }
    provideCompletionItems(document, position, _token) {
        return new Promise((resolve, reject) => {
            this.backend.getCodeCompletionCandidates(document.fileName, position.character, position.line + 1)
                .then((candidates) => {
                const completionList = [];
                candidates.forEach((info) => {
                    const item = new vscode_1.CompletionItem(info.name, (0, Symbol_1.translateCompletionKind)(info.kind));
                    item.sortText = sortKeys[info.kind] + info.name;
                    item.detail = (info.description !== undefined) ? info.description : details[info.kind];
                    completionList.push(item);
                });
                resolve(new vscode_1.CompletionList(completionList, false));
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
}
exports.AntlrCompletionItemProvider = AntlrCompletionItemProvider;
//# sourceMappingURL=CompletionItemProvider.js.map
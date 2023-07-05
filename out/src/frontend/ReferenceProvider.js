"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntlrReferenceProvider = void 0;
const vscode_1 = require("vscode");
class AntlrReferenceProvider {
    backend;
    constructor(backend) {
        this.backend = backend;
    }
    provideReferences(document, position, _context, _token) {
        return new Promise((resolve) => {
            const info = this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1, false);
            const result = [];
            if (info) {
                const occurrences = this.backend.getSymbolOccurrences(document.fileName, info.name);
                for (const symbol of occurrences) {
                    if (symbol.definition) {
                        const range = new vscode_1.Range(symbol.definition.range.start.row - 1, symbol.definition.range.start.column, symbol.definition.range.end.row - 1, symbol.definition.range.start.column + info.name.length);
                        const location = new vscode_1.Location(vscode_1.Uri.file(symbol.source), range);
                        result.push(location);
                    }
                }
                resolve(result);
            }
        });
    }
}
exports.AntlrReferenceProvider = AntlrReferenceProvider;
//# sourceMappingURL=ReferenceProvider.js.map
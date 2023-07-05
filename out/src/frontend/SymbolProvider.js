"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntlrSymbolProvider = void 0;
const vscode_1 = require("vscode");
const types_1 = require("../backend/types");
const Symbol_1 = require("./Symbol");
class AntlrSymbolProvider {
    backend;
    constructor(backend) {
        this.backend = backend;
    }
    provideDocumentSymbols(document, _cancel) {
        return new Promise((resolve) => {
            const symbols = this.backend.listTopLevelSymbols(document.fileName, false);
            const symbolsList = [];
            for (const symbol of symbols) {
                if (!symbol.definition) {
                    continue;
                }
                const startRow = symbol.definition.range.start.row > 0 ? symbol.definition.range.start.row - 1 : 0;
                const endRow = symbol.definition.range.end.row > 0 ? symbol.definition.range.end.row - 1 : 0;
                const range = new vscode_1.Range(startRow, symbol.definition.range.start.column, endRow, symbol.definition.range.end.column);
                const location = new vscode_1.Location(vscode_1.Uri.file(symbol.source), range);
                let description = (0, Symbol_1.symbolDescriptionFromEnum)(symbol.kind);
                const kind = (0, Symbol_1.translateSymbolKind)(symbol.kind);
                const totalTextLength = symbol.name.length + description.length + 1;
                if (symbol.kind === types_1.SymbolKind.LexerMode && totalTextLength < 80) {
                    const markerWidth = 80 - totalTextLength;
                    description += " " + "-".repeat(markerWidth);
                }
                const info = new vscode_1.SymbolInformation(symbol.name, kind, description, location);
                symbolsList.push(info);
            }
            resolve(symbolsList);
        });
    }
}
exports.AntlrSymbolProvider = AntlrSymbolProvider;
//# sourceMappingURL=SymbolProvider.js.map
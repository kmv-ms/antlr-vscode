"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntlrCodeLensProvider = void 0;
const vscode_1 = require("vscode");
const types_1 = require("../backend/types");
class SymbolCodeLens extends vscode_1.CodeLens {
    symbol;
    constructor(symbol, range) {
        super(range);
        this.symbol = symbol;
    }
}
class AntlrCodeLensProvider {
    backend;
    changeEvent = new vscode_1.EventEmitter();
    documentName;
    constructor(backend) {
        this.backend = backend;
    }
    get onDidChangeCodeLenses() {
        return this.changeEvent.event;
    }
    refresh() {
        this.changeEvent.fire();
    }
    provideCodeLenses(document, _token) {
        return new Promise((resolve) => {
            if (vscode_1.workspace.getConfiguration("antlr4.referencesCodeLens").enabled !== true) {
                resolve(null);
            }
            else {
                this.documentName = document.fileName;
                const symbols = this.backend.listTopLevelSymbols(document.fileName, false);
                const lenses = [];
                for (const symbol of symbols) {
                    if (!symbol.definition) {
                        continue;
                    }
                    switch (symbol.kind) {
                        case types_1.SymbolKind.FragmentLexerToken:
                        case types_1.SymbolKind.LexerRule:
                        case types_1.SymbolKind.LexerMode:
                        case types_1.SymbolKind.ParserRule: {
                            const range = new vscode_1.Range(symbol.definition.range.start.row - 1, symbol.definition.range.start.column, symbol.definition.range.end.row - 1, symbol.definition.range.end.column);
                            const lens = new SymbolCodeLens(symbol, range);
                            lenses.push(lens);
                            break;
                        }
                        default:
                    }
                }
                resolve(lenses);
            }
        });
    }
    resolveCodeLens(codeLens, _token) {
        const refs = this.backend.countReferences(this.documentName, codeLens.symbol.name);
        codeLens.command = {
            title: (refs === 1) ? "1 reference" : `${refs} references`,
            command: "",
            arguments: undefined,
        };
        return codeLens;
    }
}
exports.AntlrCodeLensProvider = AntlrCodeLensProvider;
//# sourceMappingURL=CodeLensProvider.js.map
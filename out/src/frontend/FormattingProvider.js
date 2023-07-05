"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntlrFormattingProvider = void 0;
const vscode_1 = require("vscode");
class AntlrFormattingProvider {
    backend;
    constructor(backend) {
        this.backend = backend;
    }
    provideDocumentRangeFormattingEdits(document, range, _options, _token) {
        let start = document.offsetAt(range.start);
        let end = document.offsetAt(range.end) - 1;
        const formatOptions = vscode_1.workspace.getConfiguration("antlr4.format");
        let text = "";
        [text, start, end] = this.backend.formatGrammar(document.fileName, Object.assign({}, formatOptions), start, end);
        const resultRange = range.with(document.positionAt(start), document.positionAt(end + 1));
        return [vscode_1.TextEdit.replace(resultRange, text)];
    }
}
exports.AntlrFormattingProvider = AntlrFormattingProvider;
//# sourceMappingURL=FormattingProvider.js.map
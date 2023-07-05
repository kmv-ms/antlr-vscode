"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntlrDefinitionProvider = void 0;
const vscode_1 = require("vscode");
class AntlrDefinitionProvider {
    backend;
    constructor(backend) {
        this.backend = backend;
    }
    provideDefinition(document, position, _token) {
        return new Promise((resolve) => {
            const info = this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1, true);
            if (!info) {
                resolve(null);
            }
            else {
                if (info.definition) {
                    const range = new vscode_1.Range(info.definition.range.start.row - 1, info.definition.range.start.column, info.definition.range.end.row - 1, info.definition.range.end.column);
                    resolve(new vscode_1.Location(vscode_1.Uri.file(info.source), range));
                }
                else {
                    resolve(new vscode_1.Location(vscode_1.Uri.parse(""), new vscode_1.Position(0, 0)));
                }
            }
        });
    }
}
exports.AntlrDefinitionProvider = AntlrDefinitionProvider;
//# sourceMappingURL=DefinitionProvider.js.map
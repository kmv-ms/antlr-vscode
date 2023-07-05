"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendUtils = void 0;
const tree_1 = require("antlr4ts/tree");
class BackendUtils {
    static parseTreeFromPosition = (root, column, row) => {
        if (root instanceof tree_1.TerminalNode) {
            const terminal = (root);
            const token = terminal.symbol;
            if (token.line !== row) {
                return undefined;
            }
            const tokenStop = token.charPositionInLine + (token.stopIndex - token.startIndex + 1);
            if (token.charPositionInLine <= column && tokenStop >= column) {
                return terminal;
            }
            return undefined;
        }
        else {
            const context = root;
            if (!context.start || !context.stop) {
                return undefined;
            }
            if (context.start.line > row || (context.start.line === row && column < context.start.charPositionInLine)) {
                return undefined;
            }
            const tokenStop = context.stop.charPositionInLine + (context.stop.stopIndex - context.stop.startIndex + 1);
            if (context.stop.line < row || (context.stop.line === row && tokenStop < column)) {
                return undefined;
            }
            if (context.children) {
                for (const child of context.children) {
                    const result = BackendUtils.parseTreeFromPosition(child, column, row);
                    if (result) {
                        return result;
                    }
                }
            }
            return context;
        }
    };
}
exports.BackendUtils = BackendUtils;
//# sourceMappingURL=BackendUtils.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticListener = void 0;
const types_1 = require("./types");
const antlr4ts_1 = require("antlr4ts");
const tree_1 = require("antlr4ts/tree");
class SemanticListener {
    diagnostics;
    symbolTable;
    seenSymbols = new Map();
    constructor(diagnostics, symbolTable) {
        this.diagnostics = diagnostics;
        this.symbolTable = symbolTable;
    }
    exitTerminalRule = (ctx) => {
        const tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            const symbol = tokenRef.text;
            this.checkSymbolExistence(true, types_1.SymbolGroupKind.TokenRef, symbol, "Unknown token reference", tokenRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };
    exitRuleref = (ctx) => {
        const ruleRef = ctx.RULE_REF();
        if (ruleRef) {
            const symbol = ruleRef.text;
            this.checkSymbolExistence(true, types_1.SymbolGroupKind.RuleRef, symbol, "Unknown parser rule", ruleRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };
    exitSetElement = (ctx) => {
        const tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            const symbol = tokenRef.text;
            this.checkSymbolExistence(true, types_1.SymbolGroupKind.TokenRef, symbol, "Unknown token reference", tokenRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };
    exitLexerCommand = (ctx) => {
        const lexerCommandExpr = ctx.lexerCommandExpr();
        const lexerCommandExprId = lexerCommandExpr ? lexerCommandExpr.identifier() : undefined;
        if (lexerCommandExprId) {
            let name = ctx.lexerCommandName().text;
            let kind = types_1.SymbolGroupKind.TokenRef;
            const value = name.toLowerCase();
            if (value === "pushmode" || value === "mode") {
                name = "mode";
                kind = types_1.SymbolGroupKind.LexerMode;
            }
            else if (value === "channel") {
                kind = types_1.SymbolGroupKind.TokenChannel;
            }
            const symbol = lexerCommandExprId.text;
            this.checkSymbolExistence(true, kind, symbol, "Unknown " + name, lexerCommandExprId.start);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };
    exitLexerRuleSpec = (ctx) => {
        const tokenRef = ctx.TOKEN_REF();
        const name = tokenRef.text;
        const seenSymbol = this.seenSymbols.get(name);
        if (seenSymbol) {
            this.reportDuplicateSymbol(name, tokenRef.symbol, seenSymbol);
        }
        else {
            this.seenSymbols.set(name, tokenRef.symbol);
            void this.resolveAndReportDuplicate(name, tokenRef);
        }
    };
    exitParserRuleSpec = (ctx) => {
        const ruleRef = ctx.RULE_REF();
        const name = ruleRef.text;
        const seenSymbol = this.seenSymbols.get(name);
        if (seenSymbol) {
            this.reportDuplicateSymbol(name, ruleRef.symbol, seenSymbol);
        }
        else {
            this.seenSymbols.set(name, ruleRef.symbol);
            void this.resolveAndReportDuplicate(name, ruleRef);
        }
    };
    visitTerminal = (_node) => {
    };
    checkSymbolExistence(mustExist, kind, symbol, message, offendingToken) {
        if (this.symbolTable.symbolExistsInGroup(symbol, kind, false) !== mustExist) {
            const entry = {
                type: types_1.DiagnosticType.Error,
                message: message + " '" + symbol + "'",
                range: {
                    start: {
                        column: offendingToken.charPositionInLine,
                        row: offendingToken.line,
                    },
                    end: {
                        column: offendingToken.charPositionInLine + offendingToken.stopIndex -
                            offendingToken.startIndex + 1,
                        row: offendingToken.line,
                    },
                },
            };
            this.diagnostics.push(entry);
        }
    }
    reportDuplicateSymbol(symbol, offendingToken, _previousToken) {
        const entry = {
            type: types_1.DiagnosticType.Error,
            message: "Duplicate symbol '" + symbol + "'",
            range: {
                start: {
                    column: offendingToken.charPositionInLine,
                    row: offendingToken.line,
                },
                end: {
                    column: offendingToken.charPositionInLine + offendingToken.stopIndex -
                        offendingToken.startIndex + 1,
                    row: offendingToken.line,
                },
            },
        };
        this.diagnostics.push(entry);
    }
    async resolveAndReportDuplicate(name, ruleRef) {
        const symbol = await this.symbolTable.resolve(name);
        if (symbol) {
            if (symbol.root !== this.symbolTable) {
                let start;
                if (symbol.context instanceof antlr4ts_1.ParserRuleContext) {
                    start = symbol.context.start;
                }
                else if (symbol.context instanceof tree_1.TerminalNode) {
                    start = symbol.context.symbol;
                }
                this.reportDuplicateSymbol(name, ruleRef.symbol, start);
            }
        }
    }
}
exports.SemanticListener = SemanticListener;
//# sourceMappingURL=SemanticListener.js.map
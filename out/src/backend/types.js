"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeActionType = exports.DiagnosticType = exports.SymbolKind = exports.SymbolGroupKind = exports.GrammarType = void 0;
var GrammarType;
(function (GrammarType) {
    GrammarType[GrammarType["Unknown"] = 0] = "Unknown";
    GrammarType[GrammarType["Parser"] = 1] = "Parser";
    GrammarType[GrammarType["Lexer"] = 2] = "Lexer";
    GrammarType[GrammarType["Combined"] = 3] = "Combined";
})(GrammarType = exports.GrammarType || (exports.GrammarType = {}));
var SymbolGroupKind;
(function (SymbolGroupKind) {
    SymbolGroupKind[SymbolGroupKind["TokenRef"] = 0] = "TokenRef";
    SymbolGroupKind[SymbolGroupKind["RuleRef"] = 1] = "RuleRef";
    SymbolGroupKind[SymbolGroupKind["LexerMode"] = 2] = "LexerMode";
    SymbolGroupKind[SymbolGroupKind["TokenChannel"] = 3] = "TokenChannel";
})(SymbolGroupKind = exports.SymbolGroupKind || (exports.SymbolGroupKind = {}));
var SymbolKind;
(function (SymbolKind) {
    SymbolKind[SymbolKind["Unknown"] = 0] = "Unknown";
    SymbolKind[SymbolKind["Terminal"] = 1] = "Terminal";
    SymbolKind[SymbolKind["Keyword"] = 2] = "Keyword";
    SymbolKind[SymbolKind["TokenVocab"] = 3] = "TokenVocab";
    SymbolKind[SymbolKind["Import"] = 4] = "Import";
    SymbolKind[SymbolKind["BuiltInLexerToken"] = 5] = "BuiltInLexerToken";
    SymbolKind[SymbolKind["VirtualLexerToken"] = 6] = "VirtualLexerToken";
    SymbolKind[SymbolKind["FragmentLexerToken"] = 7] = "FragmentLexerToken";
    SymbolKind[SymbolKind["LexerRule"] = 8] = "LexerRule";
    SymbolKind[SymbolKind["BuiltInMode"] = 9] = "BuiltInMode";
    SymbolKind[SymbolKind["LexerMode"] = 10] = "LexerMode";
    SymbolKind[SymbolKind["BuiltInChannel"] = 11] = "BuiltInChannel";
    SymbolKind[SymbolKind["TokenChannel"] = 12] = "TokenChannel";
    SymbolKind[SymbolKind["ParserRule"] = 13] = "ParserRule";
    SymbolKind[SymbolKind["Operator"] = 14] = "Operator";
    SymbolKind[SymbolKind["Option"] = 15] = "Option";
    SymbolKind[SymbolKind["TokenReference"] = 16] = "TokenReference";
    SymbolKind[SymbolKind["RuleReference"] = 17] = "RuleReference";
    SymbolKind[SymbolKind["LexerCommand"] = 18] = "LexerCommand";
    SymbolKind[SymbolKind["GlobalNamedAction"] = 19] = "GlobalNamedAction";
    SymbolKind[SymbolKind["LocalNamedAction"] = 20] = "LocalNamedAction";
    SymbolKind[SymbolKind["ExceptionAction"] = 21] = "ExceptionAction";
    SymbolKind[SymbolKind["FinallyAction"] = 22] = "FinallyAction";
    SymbolKind[SymbolKind["ParserAction"] = 23] = "ParserAction";
    SymbolKind[SymbolKind["LexerAction"] = 24] = "LexerAction";
    SymbolKind[SymbolKind["ParserPredicate"] = 25] = "ParserPredicate";
    SymbolKind[SymbolKind["LexerPredicate"] = 26] = "LexerPredicate";
    SymbolKind[SymbolKind["Arguments"] = 27] = "Arguments";
})(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
var DiagnosticType;
(function (DiagnosticType) {
    DiagnosticType[DiagnosticType["Hint"] = 0] = "Hint";
    DiagnosticType[DiagnosticType["Info"] = 1] = "Info";
    DiagnosticType[DiagnosticType["Warning"] = 2] = "Warning";
    DiagnosticType[DiagnosticType["Error"] = 3] = "Error";
})(DiagnosticType = exports.DiagnosticType || (exports.DiagnosticType = {}));
var CodeActionType;
(function (CodeActionType) {
    CodeActionType[CodeActionType["GlobalNamed"] = 0] = "GlobalNamed";
    CodeActionType[CodeActionType["LocalNamed"] = 1] = "LocalNamed";
    CodeActionType[CodeActionType["ParserAction"] = 2] = "ParserAction";
    CodeActionType[CodeActionType["LexerAction"] = 3] = "LexerAction";
    CodeActionType[CodeActionType["ParserPredicate"] = 4] = "ParserPredicate";
    CodeActionType[CodeActionType["LexerPredicate"] = 5] = "LexerPredicate";
})(CodeActionType = exports.CodeActionType || (exports.CodeActionType = {}));
//# sourceMappingURL=types.js.map
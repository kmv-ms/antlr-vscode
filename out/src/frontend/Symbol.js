"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateCompletionKind = exports.translateSymbolKind = exports.symbolDescriptionFromEnum = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("../backend/types");
const symbolDescriptionMap = new Map([
    [types_1.SymbolKind.Terminal, "Terminal"],
    [types_1.SymbolKind.Keyword, "Keyword"],
    [types_1.SymbolKind.TokenVocab, "Token Vocabulary"],
    [types_1.SymbolKind.Import, "Import"],
    [types_1.SymbolKind.BuiltInLexerToken, "Built-in Lexer Token"],
    [types_1.SymbolKind.VirtualLexerToken, "Virtual Lexer Token"],
    [types_1.SymbolKind.FragmentLexerToken, "Fragment Lexer Token"],
    [types_1.SymbolKind.LexerRule, "Lexer Rule"],
    [types_1.SymbolKind.BuiltInMode, "Built-in Lexer Mode"],
    [types_1.SymbolKind.LexerMode, "Lexer Mode"],
    [types_1.SymbolKind.BuiltInChannel, "Built-in Token Channel"],
    [types_1.SymbolKind.TokenChannel, "Token Channel"],
    [types_1.SymbolKind.ParserRule, "Parser Rule"],
    [types_1.SymbolKind.Operator, "Operator"],
    [types_1.SymbolKind.Option, "Grammar Option"],
    [types_1.SymbolKind.TokenReference, "Token (Lexer Rule) Reference"],
    [types_1.SymbolKind.RuleReference, "Parser Rule Reference"],
    [types_1.SymbolKind.GlobalNamedAction, "Global Named Action"],
    [types_1.SymbolKind.LocalNamedAction, "Local Named Action"],
    [types_1.SymbolKind.LexerCommand, "Lexer Command"],
    [types_1.SymbolKind.ExceptionAction, "Exception Action Code"],
    [types_1.SymbolKind.FinallyAction, "Finally Action Code"],
    [types_1.SymbolKind.ParserAction, "Parser Action"],
    [types_1.SymbolKind.LexerAction, "Lexer Action"],
    [types_1.SymbolKind.ParserPredicate, "Parser Predicate"],
    [types_1.SymbolKind.LexerPredicate, "Lexer Predicate"],
    [types_1.SymbolKind.Arguments, "Native Arguments"],
]);
const symbolDescriptionFromEnum = (kind) => {
    return symbolDescriptionMap.get(kind) || "Unknown";
};
exports.symbolDescriptionFromEnum = symbolDescriptionFromEnum;
const symbolCodeTypeMap = new Map([
    [types_1.SymbolKind.Terminal, vscode.SymbolKind.EnumMember],
    [types_1.SymbolKind.Keyword, vscode.SymbolKind.Key],
    [types_1.SymbolKind.TokenVocab, vscode.SymbolKind.Module],
    [types_1.SymbolKind.Import, vscode.SymbolKind.Module],
    [types_1.SymbolKind.BuiltInLexerToken, vscode.SymbolKind.Enum],
    [types_1.SymbolKind.VirtualLexerToken, vscode.SymbolKind.Enum],
    [types_1.SymbolKind.FragmentLexerToken, vscode.SymbolKind.Enum],
    [types_1.SymbolKind.LexerRule, vscode.SymbolKind.Function],
    [types_1.SymbolKind.BuiltInMode, vscode.SymbolKind.Variable],
    [types_1.SymbolKind.LexerMode, vscode.SymbolKind.Variable],
    [types_1.SymbolKind.BuiltInChannel, vscode.SymbolKind.Number],
    [types_1.SymbolKind.TokenChannel, vscode.SymbolKind.Number],
    [types_1.SymbolKind.ParserRule, vscode.SymbolKind.Function],
    [types_1.SymbolKind.Operator, vscode.SymbolKind.Operator],
    [types_1.SymbolKind.Option, vscode.SymbolKind.Object],
    [types_1.SymbolKind.TokenReference, vscode.SymbolKind.Function],
    [types_1.SymbolKind.RuleReference, vscode.SymbolKind.Function],
    [types_1.SymbolKind.GlobalNamedAction, vscode.SymbolKind.Struct],
    [types_1.SymbolKind.LocalNamedAction, vscode.SymbolKind.Struct],
    [types_1.SymbolKind.LexerCommand, vscode.SymbolKind.Struct],
    [types_1.SymbolKind.ExceptionAction, vscode.SymbolKind.Struct],
    [types_1.SymbolKind.FinallyAction, vscode.SymbolKind.Struct],
    [types_1.SymbolKind.ParserAction, vscode.SymbolKind.Struct],
    [types_1.SymbolKind.LexerAction, vscode.SymbolKind.Struct],
    [types_1.SymbolKind.ParserPredicate, vscode.SymbolKind.Event],
    [types_1.SymbolKind.LexerPredicate, vscode.SymbolKind.Event],
    [types_1.SymbolKind.Arguments, vscode.SymbolKind.TypeParameter],
]);
const translateSymbolKind = (kind) => {
    return symbolCodeTypeMap.get(kind) || vscode.SymbolKind.Null;
};
exports.translateSymbolKind = translateSymbolKind;
const symbolCompletionTypeMap = new Map([
    [types_1.SymbolKind.Terminal, vscode.CompletionItemKind.EnumMember],
    [types_1.SymbolKind.Keyword, vscode.CompletionItemKind.Keyword],
    [types_1.SymbolKind.TokenVocab, vscode.CompletionItemKind.Module],
    [types_1.SymbolKind.Import, vscode.CompletionItemKind.Module],
    [types_1.SymbolKind.BuiltInLexerToken, vscode.CompletionItemKind.Enum],
    [types_1.SymbolKind.VirtualLexerToken, vscode.CompletionItemKind.Enum],
    [types_1.SymbolKind.FragmentLexerToken, vscode.CompletionItemKind.Enum],
    [types_1.SymbolKind.LexerRule, vscode.CompletionItemKind.Function],
    [types_1.SymbolKind.BuiltInMode, vscode.CompletionItemKind.Variable],
    [types_1.SymbolKind.LexerMode, vscode.CompletionItemKind.Variable],
    [types_1.SymbolKind.BuiltInChannel, vscode.CompletionItemKind.Value],
    [types_1.SymbolKind.TokenChannel, vscode.CompletionItemKind.Value],
    [types_1.SymbolKind.ParserRule, vscode.CompletionItemKind.Function],
    [types_1.SymbolKind.Operator, vscode.CompletionItemKind.Operator],
    [types_1.SymbolKind.Option, vscode.CompletionItemKind.User],
    [types_1.SymbolKind.TokenReference, vscode.CompletionItemKind.Function],
    [types_1.SymbolKind.RuleReference, vscode.CompletionItemKind.Function],
    [types_1.SymbolKind.GlobalNamedAction, vscode.CompletionItemKind.Struct],
    [types_1.SymbolKind.LocalNamedAction, vscode.CompletionItemKind.Struct],
    [types_1.SymbolKind.LexerCommand, vscode.CompletionItemKind.Struct],
    [types_1.SymbolKind.ExceptionAction, vscode.CompletionItemKind.Struct],
    [types_1.SymbolKind.FinallyAction, vscode.CompletionItemKind.Struct],
    [types_1.SymbolKind.ParserAction, vscode.CompletionItemKind.Struct],
    [types_1.SymbolKind.LexerAction, vscode.CompletionItemKind.Struct],
    [types_1.SymbolKind.ParserPredicate, vscode.CompletionItemKind.Event],
    [types_1.SymbolKind.LexerPredicate, vscode.CompletionItemKind.Event],
    [types_1.SymbolKind.Arguments, vscode.CompletionItemKind.TypeParameter],
]);
const translateCompletionKind = (kind) => {
    return symbolCompletionTypeMap.get(kind) || vscode.CompletionItemKind.Text;
};
exports.translateCompletionKind = translateCompletionKind;
//# sourceMappingURL=Symbol.js.map
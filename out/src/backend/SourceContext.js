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
exports.SourceContext = void 0;
const child_process = __importStar(require("child_process"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const vm = __importStar(require("vm"));
const antlr4ts_1 = require("antlr4ts");
const atn_1 = require("antlr4ts/atn");
const misc_1 = require("antlr4ts/misc");
const tree_1 = require("antlr4ts/tree");
const antlr4_c3_1 = require("antlr4-c3");
const ANTLRv4Parser_1 = require("../parser/ANTLRv4Parser");
const ANTLRv4Lexer_1 = require("../parser/ANTLRv4Lexer");
const types_1 = require("./types");
const ContextErrorListener_1 = require("./ContextErrorListener");
const ContextLexerErrorListener_1 = require("./ContextLexerErrorListener");
const DetailsListener_1 = require("./DetailsListener");
const SemanticListener_1 = require("./SemanticListener");
const RuleVisitor_1 = require("./RuleVisitor");
const InterpreterDataReader_1 = require("./InterpreterDataReader");
const ErrorParser_1 = require("./ErrorParser");
const ContextSymbolTable_1 = require("./ContextSymbolTable");
const SentenceGenerator_1 = require("./SentenceGenerator");
const Formatter_1 = require("./Formatter");
const GrammarInterpreters_1 = require("./GrammarInterpreters");
const Unicode_1 = require("./Unicode");
const BackendUtils_1 = require("./BackendUtils");
class SourceContext {
    fileName;
    extensionDir;
    static globalSymbols = new ContextSymbolTable_1.ContextSymbolTable("Global Symbols", { allowDuplicateSymbols: false });
    static symbolToKindMap = new Map([
        [ContextSymbolTable_1.GlobalNamedActionSymbol, types_1.SymbolKind.GlobalNamedAction],
        [ContextSymbolTable_1.LocalNamedActionSymbol, types_1.SymbolKind.LocalNamedAction],
        [ContextSymbolTable_1.ImportSymbol, types_1.SymbolKind.Import],
        [ContextSymbolTable_1.BuiltInTokenSymbol, types_1.SymbolKind.BuiltInLexerToken],
        [ContextSymbolTable_1.VirtualTokenSymbol, types_1.SymbolKind.VirtualLexerToken],
        [ContextSymbolTable_1.FragmentTokenSymbol, types_1.SymbolKind.FragmentLexerToken],
        [ContextSymbolTable_1.TokenSymbol, types_1.SymbolKind.LexerRule],
        [ContextSymbolTable_1.BuiltInModeSymbol, types_1.SymbolKind.BuiltInMode],
        [ContextSymbolTable_1.LexerModeSymbol, types_1.SymbolKind.LexerMode],
        [ContextSymbolTable_1.BuiltInChannelSymbol, types_1.SymbolKind.BuiltInChannel],
        [ContextSymbolTable_1.TokenChannelSymbol, types_1.SymbolKind.TokenChannel],
        [ContextSymbolTable_1.RuleSymbol, types_1.SymbolKind.ParserRule],
        [ContextSymbolTable_1.OperatorSymbol, types_1.SymbolKind.Operator],
        [ContextSymbolTable_1.TerminalSymbol, types_1.SymbolKind.Terminal],
        [ContextSymbolTable_1.TokenReferenceSymbol, types_1.SymbolKind.TokenReference],
        [ContextSymbolTable_1.RuleReferenceSymbol, types_1.SymbolKind.RuleReference],
        [ContextSymbolTable_1.LexerCommandSymbol, types_1.SymbolKind.LexerCommand],
        [ContextSymbolTable_1.ExceptionActionSymbol, types_1.SymbolKind.ExceptionAction],
        [ContextSymbolTable_1.FinallyActionSymbol, types_1.SymbolKind.FinallyAction],
        [ContextSymbolTable_1.ParserActionSymbol, types_1.SymbolKind.ParserAction],
        [ContextSymbolTable_1.LexerActionSymbol, types_1.SymbolKind.LexerAction],
        [ContextSymbolTable_1.ParserPredicateSymbol, types_1.SymbolKind.ParserPredicate],
        [ContextSymbolTable_1.LexerPredicateSymbol, types_1.SymbolKind.LexerPredicate],
        [ContextSymbolTable_1.ArgumentsSymbol, types_1.SymbolKind.Arguments],
    ]);
    static printableChars;
    symbolTable;
    sourceId;
    info = {
        type: types_1.GrammarType.Unknown,
        unreferencedRules: [],
        imports: [],
    };
    diagnostics = [];
    references = [];
    rrdScripts;
    semanticAnalysisDone = false;
    tokenStream;
    parser;
    errorListener = new ContextErrorListener_1.ContextErrorListener(this.diagnostics);
    lexerErrorListener = new ContextLexerErrorListener_1.ContextLexerErrorListener(this.diagnostics);
    grammarLexerData;
    grammarLexerRuleMap = new Map();
    grammarParserData;
    grammarParserRuleMap = new Map();
    tree;
    constructor(fileName, extensionDir) {
        this.fileName = fileName;
        this.extensionDir = extensionDir;
        this.sourceId = path.basename(fileName, path.extname(fileName));
        this.symbolTable = new ContextSymbolTable_1.ContextSymbolTable(this.sourceId, { allowDuplicateSymbols: true }, this);
        const eof = SourceContext.globalSymbols.resolve("EOF");
        eof.then((value) => {
            if (!value) {
                SourceContext.globalSymbols.addNewSymbolOfType(ContextSymbolTable_1.BuiltInChannelSymbol, undefined, "DEFAULT_TOKEN_CHANNEL");
                SourceContext.globalSymbols.addNewSymbolOfType(ContextSymbolTable_1.BuiltInChannelSymbol, undefined, "HIDDEN");
                SourceContext.globalSymbols.addNewSymbolOfType(ContextSymbolTable_1.BuiltInTokenSymbol, undefined, "EOF");
                SourceContext.globalSymbols.addNewSymbolOfType(ContextSymbolTable_1.BuiltInModeSymbol, undefined, "DEFAULT_MODE");
            }
        }).catch(() => {
        });
    }
    get isInterpreterDataLoaded() {
        return this.grammarLexerData !== undefined || this.grammarParserData !== undefined;
    }
    get interpreterData() {
        return [this.grammarLexerData, this.grammarParserData];
    }
    get hasErrors() {
        for (const diagnostic of this.diagnostics) {
            if (diagnostic.type === types_1.DiagnosticType.Error) {
                return true;
            }
        }
        return false;
    }
    static getKindFromSymbol(symbol) {
        if (symbol.name === "tokenVocab") {
            return types_1.SymbolKind.TokenVocab;
        }
        return this.symbolToKindMap.get(symbol.constructor) || types_1.SymbolKind.Unknown;
    }
    static definitionForContext(ctx, keepQuotes) {
        if (!ctx) {
            return undefined;
        }
        const result = {
            text: "",
            range: {
                start: { column: 0, row: 0 },
                end: { column: 0, row: 0 },
            },
        };
        if (ctx instanceof antlr4ts_1.ParserRuleContext) {
            const range = { a: ctx.start.startIndex, b: ctx.stop.stopIndex };
            result.range.start.column = ctx.start.charPositionInLine;
            result.range.start.row = ctx.start.line;
            result.range.end.column = ctx.stop.charPositionInLine;
            result.range.end.row = ctx.stop.line;
            if (ctx.ruleIndex === ANTLRv4Parser_1.ANTLRv4Parser.RULE_modeSpec) {
                const modeSpec = ctx;
                range.b = modeSpec.SEMI().symbol.stopIndex;
                result.range.end.column = modeSpec.SEMI().symbol.charPositionInLine;
                result.range.end.row = modeSpec.SEMI().symbol.line;
            }
            else if (ctx.ruleIndex === ANTLRv4Parser_1.ANTLRv4Parser.RULE_grammarSpec) {
                const grammarSpec = ctx;
                range.b = grammarSpec.SEMI().symbol.stopIndex;
                result.range.end.column = grammarSpec.SEMI().symbol.charPositionInLine;
                result.range.end.row = grammarSpec.SEMI().symbol.line;
                range.a = grammarSpec.grammarType().start.startIndex;
                result.range.start.column = grammarSpec.grammarType().start.charPositionInLine;
                result.range.start.row = grammarSpec.grammarType().start.line;
            }
            if (ctx.start.tokenSource?.inputStream) {
                const stream = ctx.start.tokenSource.inputStream;
                try {
                    result.text = stream.getText(range);
                }
                catch (e) {
                }
            }
        }
        else if (ctx instanceof tree_1.TerminalNode) {
            result.text = ctx.text;
            result.range.start.column = ctx.symbol.charPositionInLine;
            result.range.start.row = ctx.symbol.line;
            result.range.end.column = ctx.symbol.charPositionInLine + result.text.length;
            result.range.end.row = ctx.symbol.line;
        }
        if (keepQuotes || result.text.length < 2) {
            return result;
        }
        const quoteChar = result.text[0];
        if ((quoteChar === '"' || quoteChar === "`" || quoteChar === "'")
            && quoteChar === result.text[result.text.length - 1]) {
            result.text = result.text.substr(1, result.text.length - 2);
        }
        return result;
    }
    symbolAtPosition(column, row, limitToChildren) {
        const terminal = BackendUtils_1.BackendUtils.parseTreeFromPosition(this.tree, column, row);
        if (!terminal || !(terminal instanceof tree_1.TerminalNode)) {
            return undefined;
        }
        if (!limitToChildren) {
            return this.getSymbolInfo(terminal.text);
        }
        let parent = terminal.parent;
        if (parent.ruleIndex === ANTLRv4Parser_1.ANTLRv4Parser.RULE_identifier) {
            parent = parent.parent;
        }
        switch (parent.ruleIndex) {
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_ruleref:
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_terminalRule: {
                let symbol = this.symbolTable.symbolContainingContext(terminal);
                if (symbol) {
                    symbol = this.resolveSymbol(symbol.name);
                    if (symbol) {
                        return this.getSymbolInfo(symbol);
                    }
                }
                break;
            }
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_actionBlock:
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_ruleAction:
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_lexerCommandExpr:
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_optionValue:
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_delegateGrammar:
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_modeSpec:
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_setElement: {
                const symbol = this.symbolTable.symbolContainingContext(terminal);
                if (symbol) {
                    return this.getSymbolInfo(symbol);
                }
                break;
            }
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_lexerCommand:
            case ANTLRv4Parser_1.ANTLRv4Parser.RULE_lexerCommandName: {
                const symbol = this.symbolTable.symbolContainingContext(terminal);
                if (symbol) {
                    return this.getSymbolInfo(symbol);
                }
                break;
            }
            default: {
                break;
            }
        }
        return undefined;
    }
    enclosingSymbolAtPosition(column, row, ruleScope) {
        let context = BackendUtils_1.BackendUtils.parseTreeFromPosition(this.tree, column, row);
        if (!context) {
            return undefined;
        }
        if (context instanceof tree_1.TerminalNode) {
            context = context.parent;
        }
        if (ruleScope) {
            let run = context;
            while (run
                && !(run instanceof ANTLRv4Parser_1.ParserRuleSpecContext)
                && !(run instanceof ANTLRv4Parser_1.OptionsSpecContext)
                && !(run instanceof ANTLRv4Parser_1.LexerRuleSpecContext)) {
                run = run.parent;
            }
            if (run) {
                context = run;
            }
        }
        if (context) {
            const symbol = this.symbolTable.symbolWithContextSync(context);
            if (symbol) {
                return this.symbolTable.getSymbolInfo(symbol);
            }
        }
        return undefined;
    }
    listTopLevelSymbols(includeDependencies) {
        return this.symbolTable.listTopLevelSymbols(includeDependencies);
    }
    getVocabulary() {
        if (this.grammarLexerData) {
            return this.grammarLexerData.vocabulary;
        }
    }
    getRuleList() {
        if (this.grammarParserData) {
            return this.grammarParserData.ruleNames;
        }
    }
    getChannels() {
        if (this.grammarLexerData) {
            return this.grammarLexerData.channels;
        }
    }
    getModes() {
        if (this.grammarLexerData) {
            return this.grammarLexerData.modes;
        }
    }
    listActions(type) {
        return this.symbolTable.listActions(type);
    }
    getActionCounts() {
        return this.symbolTable.getActionCounts();
    }
    async getCodeCompletionCandidates(column, row) {
        if (!this.parser) {
            return [];
        }
        const core = new antlr4_c3_1.CodeCompletionCore(this.parser);
        core.showResult = false;
        core.ignoredTokens = new Set([
            ANTLRv4Lexer_1.ANTLRv4Lexer.TOKEN_REF,
            ANTLRv4Lexer_1.ANTLRv4Lexer.RULE_REF,
            ANTLRv4Lexer_1.ANTLRv4Lexer.LEXER_CHAR_SET,
            ANTLRv4Lexer_1.ANTLRv4Lexer.DOC_COMMENT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.BLOCK_COMMENT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.INT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.STRING_LITERAL,
            ANTLRv4Lexer_1.ANTLRv4Lexer.UNTERMINATED_STRING_LITERAL,
            ANTLRv4Lexer_1.ANTLRv4Lexer.MODE,
            ANTLRv4Lexer_1.ANTLRv4Lexer.COLON,
            ANTLRv4Lexer_1.ANTLRv4Lexer.COLONCOLON,
            ANTLRv4Lexer_1.ANTLRv4Lexer.COMMA,
            ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI,
            ANTLRv4Lexer_1.ANTLRv4Lexer.LPAREN,
            ANTLRv4Lexer_1.ANTLRv4Lexer.RPAREN,
            ANTLRv4Lexer_1.ANTLRv4Lexer.LBRACE,
            ANTLRv4Lexer_1.ANTLRv4Lexer.RBRACE,
            ANTLRv4Lexer_1.ANTLRv4Lexer.GT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.DOLLAR,
            ANTLRv4Lexer_1.ANTLRv4Lexer.RANGE,
            ANTLRv4Lexer_1.ANTLRv4Lexer.DOT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.AT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.POUND,
            ANTLRv4Lexer_1.ANTLRv4Lexer.NOT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.ID,
            ANTLRv4Lexer_1.ANTLRv4Lexer.WS,
            ANTLRv4Lexer_1.ANTLRv4Lexer.END_ARGUMENT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.UNTERMINATED_ARGUMENT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.ARGUMENT_CONTENT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.END_ACTION,
            ANTLRv4Lexer_1.ANTLRv4Lexer.UNTERMINATED_ACTION,
            ANTLRv4Lexer_1.ANTLRv4Lexer.ACTION_CONTENT,
            ANTLRv4Lexer_1.ANTLRv4Lexer.UNTERMINATED_CHAR_SET,
            ANTLRv4Lexer_1.ANTLRv4Lexer.EOF,
            -2,
        ]);
        core.preferredRules = new Set([
            ANTLRv4Parser_1.ANTLRv4Parser.RULE_argActionBlock,
            ANTLRv4Parser_1.ANTLRv4Parser.RULE_actionBlock,
            ANTLRv4Parser_1.ANTLRv4Parser.RULE_terminalRule,
            ANTLRv4Parser_1.ANTLRv4Parser.RULE_lexerCommandName,
            ANTLRv4Parser_1.ANTLRv4Parser.RULE_identifier,
            ANTLRv4Parser_1.ANTLRv4Parser.RULE_ruleref,
        ]);
        let index;
        this.tokenStream.fill();
        for (index = 0;; ++index) {
            const token = this.tokenStream.get(index);
            if (token.type === antlr4ts_1.Token.EOF || token.line > row) {
                break;
            }
            if (token.line < row) {
                continue;
            }
            const length = token.text ? token.text.length : 0;
            if ((token.charPositionInLine + length) >= column) {
                break;
            }
        }
        const candidates = core.collectCandidates(index);
        const result = [];
        candidates.tokens.forEach((following, type) => {
            switch (type) {
                case ANTLRv4Lexer_1.ANTLRv4Lexer.RARROW: {
                    result.push({
                        kind: types_1.SymbolKind.Operator,
                        name: "->",
                        description: "Lexer action introducer",
                        source: this.fileName,
                    });
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LT: {
                    result.push({
                        kind: types_1.SymbolKind.Operator,
                        name: "< key = value >",
                        description: "Rule element option",
                        source: this.fileName,
                    });
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.ASSIGN: {
                    result.push({
                        kind: types_1.SymbolKind.Operator,
                        name: "=",
                        description: "Variable assignment",
                        source: this.fileName,
                    });
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.QUESTION: {
                    result.push({
                        kind: types_1.SymbolKind.Operator,
                        name: "?",
                        description: "Zero or one repetition operator",
                        source: this.fileName,
                    });
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.STAR: {
                    result.push({
                        kind: types_1.SymbolKind.Operator,
                        name: "*",
                        description: "Zero or more repetition operator",
                        source: this.fileName,
                    });
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.PLUS_ASSIGN: {
                    result.push({
                        kind: types_1.SymbolKind.Operator,
                        name: "+=",
                        description: "Variable list addition",
                        source: this.fileName,
                    });
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.PLUS: {
                    result.push({
                        kind: types_1.SymbolKind.Operator,
                        name: "+",
                        description: "One or more repetition operator",
                        source: this.fileName,
                    });
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.OR: {
                    result.push({
                        kind: types_1.SymbolKind.Operator,
                        name: "|",
                        description: "Rule alt separator",
                        source: this.fileName,
                    });
                    break;
                }
                default: {
                    const value = this.parser.vocabulary.getDisplayName(type);
                    result.push({
                        kind: types_1.SymbolKind.Keyword,
                        name: value[0] === "'" ? value.substr(1, value.length - 2) : value,
                        source: this.fileName,
                    });
                    break;
                }
            }
        });
        const promises = [];
        candidates.rules.forEach((candidateRule, key) => {
            switch (key) {
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_argActionBlock: {
                    result.push({
                        kind: types_1.SymbolKind.Arguments,
                        name: "[ argument action code ]",
                        source: this.fileName,
                        definition: undefined,
                        description: undefined,
                    });
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_actionBlock: {
                    result.push({
                        kind: types_1.SymbolKind.ParserAction,
                        name: "{ action code }",
                        source: this.fileName,
                        definition: undefined,
                        description: undefined,
                    });
                    const list = candidateRule.ruleList;
                    if (list[list.length - 1] === ANTLRv4Parser_1.ANTLRv4Parser.RULE_lexerElement) {
                        result.push({
                            kind: types_1.SymbolKind.LexerPredicate,
                            name: "{ predicate }?",
                            source: this.fileName,
                            definition: undefined,
                            description: undefined,
                        });
                    }
                    else if (list[list.length - 1] === ANTLRv4Parser_1.ANTLRv4Parser.RULE_element) {
                        result.push({
                            kind: types_1.SymbolKind.ParserPredicate,
                            name: "{ predicate }?",
                            source: this.fileName,
                            definition: undefined,
                            description: undefined,
                        });
                    }
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_terminalRule: {
                    promises.push(this.symbolTable.getAllSymbols(ContextSymbolTable_1.BuiltInTokenSymbol));
                    promises.push(this.symbolTable.getAllSymbols(ContextSymbolTable_1.VirtualTokenSymbol));
                    promises.push(this.symbolTable.getAllSymbols(ContextSymbolTable_1.TokenSymbol));
                    const list = candidateRule.ruleList;
                    if (list[list.length - 1] === ANTLRv4Parser_1.ANTLRv4Parser.RULE_lexerAtom) {
                        promises.push(this.symbolTable.getAllSymbols(ContextSymbolTable_1.FragmentTokenSymbol));
                    }
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_lexerCommandName: {
                    ["channel", "skip", "more", "mode", "push", "pop"].forEach((symbol) => {
                        result.push({
                            kind: types_1.SymbolKind.Keyword,
                            name: symbol,
                            source: this.fileName,
                            definition: undefined,
                            description: undefined,
                        });
                    });
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_ruleref: {
                    promises.push(this.symbolTable.getAllSymbols(ContextSymbolTable_1.RuleSymbol));
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_identifier: {
                    const list = candidateRule.ruleList;
                    switch (list[list.length - 1]) {
                        case ANTLRv4Parser_1.ANTLRv4Parser.RULE_option: {
                            ["superClass", "tokenVocab", "TokenLabelType", "contextSuperClass", "exportMacro"]
                                .forEach((symbol) => {
                                result.push({
                                    kind: types_1.SymbolKind.Option,
                                    name: symbol,
                                    source: this.fileName,
                                    definition: undefined,
                                    description: undefined,
                                });
                            });
                            break;
                        }
                        case ANTLRv4Parser_1.ANTLRv4Parser.RULE_namedAction: {
                            ["header", "members", "preinclude", "postinclude", "context", "declarations", "definitions",
                                "listenerpreinclude", "listenerpostinclude", "listenerdeclarations", "listenermembers",
                                "listenerdefinitions", "baselistenerpreinclude", "baselistenerpostinclude",
                                "baselistenerdeclarations", "baselistenermembers", "baselistenerdefinitions",
                                "visitorpreinclude", "visitorpostinclude", "visitordeclarations", "visitormembers",
                                "visitordefinitions", "basevisitorpreinclude", "basevisitorpostinclude",
                                "basevisitordeclarations", "basevisitormembers", "basevisitordefinitions"]
                                .forEach((symbol) => {
                                result.push({
                                    kind: types_1.SymbolKind.Keyword,
                                    name: symbol,
                                    source: this.fileName,
                                    definition: undefined,
                                    description: undefined,
                                });
                            });
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        });
        const symbolLists = await Promise.all(promises);
        symbolLists.forEach((symbols) => {
            if (symbols) {
                symbols.forEach((symbol) => {
                    if (symbol.name !== "EOF") {
                        result.push({
                            kind: SourceContext.getKindFromSymbol(symbol),
                            name: symbol.name,
                            source: this.fileName,
                            definition: undefined,
                            description: undefined,
                        });
                    }
                });
            }
        });
        return result;
    }
    setText(source) {
        const input = antlr4ts_1.CharStreams.fromString(source);
        const lexer = new ANTLRv4Lexer_1.ANTLRv4Lexer(input);
        lexer.removeErrorListeners();
        lexer.addErrorListener(this.lexerErrorListener);
        this.tokenStream = new antlr4ts_1.CommonTokenStream(lexer);
    }
    parse() {
        this.tokenStream.seek(0);
        this.parser = new ANTLRv4Parser_1.ANTLRv4Parser(this.tokenStream);
        this.parser.removeErrorListeners();
        this.parser.addErrorListener(this.errorListener);
        this.parser.errorHandler = new antlr4ts_1.BailErrorStrategy();
        this.parser.interpreter.setPredictionMode(atn_1.PredictionMode.SLL);
        this.tree = undefined;
        this.info.type = types_1.GrammarType.Unknown;
        this.info.imports.length = 0;
        this.grammarLexerData = undefined;
        this.grammarLexerRuleMap.clear();
        this.grammarParserData = undefined;
        this.grammarLexerRuleMap.clear();
        this.semanticAnalysisDone = false;
        this.diagnostics.length = 0;
        this.symbolTable.clear();
        this.symbolTable.addDependencies(SourceContext.globalSymbols);
        try {
            this.tree = this.parser.grammarSpec();
        }
        catch (e) {
            if (e instanceof misc_1.ParseCancellationException) {
                this.tokenStream.seek(0);
                this.parser.reset();
                this.parser.errorHandler = new antlr4ts_1.DefaultErrorStrategy();
                this.parser.interpreter.setPredictionMode(atn_1.PredictionMode.LL);
                this.tree = this.parser.grammarSpec();
            }
            else {
                throw e;
            }
        }
        if (this.tree && this.tree.childCount > 0) {
            try {
                const typeContext = this.tree.grammarType();
                if (typeContext.LEXER()) {
                    this.info.type = types_1.GrammarType.Lexer;
                }
                else if (typeContext.PARSER()) {
                    this.info.type = types_1.GrammarType.Parser;
                }
                else {
                    this.info.type = types_1.GrammarType.Combined;
                }
            }
            catch (e) {
            }
        }
        this.symbolTable.tree = this.tree;
        const listener = new DetailsListener_1.DetailsListener(this.symbolTable, this.info.imports);
        tree_1.ParseTreeWalker.DEFAULT.walk(listener, this.tree);
        this.info.unreferencedRules = this.symbolTable.getUnreferencedSymbols();
        return this.info.imports;
    }
    getDiagnostics() {
        this.runSemanticAnalysisIfNeeded();
        return this.diagnostics;
    }
    getReferenceGraph() {
        this.runSemanticAnalysisIfNeeded();
        const result = new Map();
        for (const symbol of this.symbolTable.getAllSymbolsSync(antlr4_c3_1.BaseSymbol, false)) {
            if (symbol instanceof ContextSymbolTable_1.RuleSymbol
                || symbol instanceof ContextSymbolTable_1.TokenSymbol
                || symbol instanceof ContextSymbolTable_1.FragmentTokenSymbol) {
                const entry = {
                    kind: symbol instanceof ContextSymbolTable_1.RuleSymbol ? types_1.SymbolKind.ParserRule : types_1.SymbolKind.LexerRule,
                    rules: new Set(),
                    tokens: new Set(),
                    literals: new Set(),
                };
                for (const child of symbol.getNestedSymbolsOfTypeSync(ContextSymbolTable_1.RuleReferenceSymbol)) {
                    const resolved = this.symbolTable.resolveSync(child.name, false);
                    if (resolved) {
                        entry.rules.add(resolved.qualifiedName());
                    }
                    else {
                        entry.rules.add(child.name);
                    }
                }
                for (const child of symbol.getNestedSymbolsOfTypeSync(ContextSymbolTable_1.TokenReferenceSymbol)) {
                    const resolved = this.symbolTable.resolveSync(child.name, false);
                    if (resolved) {
                        entry.tokens.add(resolved.qualifiedName());
                    }
                    else {
                        entry.tokens.add(child.name);
                    }
                }
                for (const child of symbol.getNestedSymbolsOfTypeSync(antlr4_c3_1.LiteralSymbol)) {
                    const resolved = this.symbolTable.resolveSync(child.name, false);
                    if (resolved) {
                        entry.literals.add(resolved.qualifiedName());
                    }
                    else {
                        entry.literals.add(child.name);
                    }
                }
                result.set(symbol.qualifiedName(), entry);
            }
            else if (symbol instanceof ContextSymbolTable_1.BuiltInTokenSymbol) {
                result.set(symbol.qualifiedName(), {
                    kind: types_1.SymbolKind.BuiltInLexerToken,
                    rules: new Set(),
                    tokens: new Set(),
                    literals: new Set(),
                });
            }
            else if (symbol instanceof ContextSymbolTable_1.VirtualTokenSymbol) {
                result.set(symbol.qualifiedName(), {
                    kind: types_1.SymbolKind.VirtualLexerToken,
                    rules: new Set(),
                    tokens: new Set(),
                    literals: new Set(),
                });
            }
        }
        return result;
    }
    getRRDScript(ruleName) {
        this.runSemanticAnalysisIfNeeded();
        return this.rrdScripts.get(ruleName);
    }
    addAsReferenceTo(context) {
        const pipeline = [context];
        while (pipeline.length > 0) {
            const current = pipeline.shift();
            if (!current) {
                continue;
            }
            if (current.references.indexOf(this) > -1) {
                return;
            }
            pipeline.push(...current.references);
        }
        context.references.push(this);
        this.symbolTable.addDependencies(context.symbolTable);
    }
    removeDependency(context) {
        const index = context.references.indexOf(this);
        if (index > -1) {
            context.references.splice(index, 1);
        }
        this.symbolTable.removeDependency(context.symbolTable);
    }
    getReferenceCount(symbol) {
        this.runSemanticAnalysisIfNeeded();
        let result = this.symbolTable.getReferenceCount(symbol);
        for (const reference of this.references) {
            result += reference.getReferenceCount(symbol);
        }
        return result;
    }
    async getAllSymbols(recursive) {
        const result = await this.symbolTable.getAllSymbols(antlr4_c3_1.BaseSymbol, !recursive);
        for (const reference of this.references) {
            const symbols = await reference.symbolTable.getAllSymbols(antlr4_c3_1.BaseSymbol, true);
            symbols.forEach((value) => {
                result.push(value);
            });
        }
        return result;
    }
    ruleFromPosition(column, row) {
        const tree = BackendUtils_1.BackendUtils.parseTreeFromPosition(this.tree, column, row);
        if (!tree) {
            return [undefined, undefined];
        }
        let context = tree;
        while (context && context.ruleIndex !== ANTLRv4Parser_1.ANTLRv4Parser.RULE_parserRuleSpec
            && context.ruleIndex !== ANTLRv4Parser_1.ANTLRv4Parser.RULE_lexerRuleSpec) {
            context = context.parent;
        }
        if (context) {
            if (context.ruleIndex === ANTLRv4Parser_1.ANTLRv4Parser.RULE_parserRuleSpec) {
                const ruleName = context.RULE_REF().text;
                let ruleIndex;
                if (this.grammarParserData) {
                    ruleIndex = this.grammarParserRuleMap.get(ruleName);
                }
                return [ruleName, ruleIndex];
            }
            const name = context.TOKEN_REF().text;
            let index;
            if (this.grammarLexerData) {
                index = this.grammarLexerRuleMap.get(name);
            }
            return [name, index];
        }
        return [undefined, undefined];
    }
    async generate(dependencies, options) {
        if (options.loadOnly) {
            const errors = this.setupInterpreters(options.outputDir);
            if (errors.length === 0) {
                if (this.grammarParserData || this.grammarLexerData || !options.generateIfNeeded) {
                    return Promise.resolve([]);
                }
            }
            else {
                return Promise.reject(errors);
            }
        }
        const parameters = ["-jar"];
        if (options.alternativeJar) {
            parameters.push(options.alternativeJar);
        }
        else {
            if (options.language?.toLowerCase() === "typescript") {
                parameters.push(path.join(this.extensionDir, "antlr/antlr4-typescript-4.9.0-SNAPSHOT-complete.jar"));
            }
            else {
                parameters.push(path.join(this.extensionDir, "antlr/antlr-4.9.2-complete.jar"));
            }
        }
        if (options.language) {
            parameters.push("-Dlanguage=" + options.language);
        }
        parameters.push("-message-format");
        parameters.push("antlr");
        if (options.libDir) {
            parameters.push("-lib");
            parameters.push(options.libDir);
        }
        if (options.outputDir) {
            parameters.push("-o");
            parameters.push(options.outputDir);
        }
        if (options.package) {
            parameters.push("-package");
            parameters.push(options.package);
        }
        const genListener = options.listeners === undefined || options.listeners === true;
        parameters.push(genListener ? "-listener" : "-no-listener");
        parameters.push(options.visitors === true ? "-visitor" : "-no-visitor");
        parameters.push("-Xexact-output-dir");
        if (options.additionalParameters) {
            parameters.push(options.additionalParameters);
        }
        dependencies.add(this);
        let message = "";
        const fileList = [];
        const spawnOptions = { cwd: options.baseDir ? options.baseDir : undefined };
        const errorParser = new ErrorParser_1.ErrorParser(dependencies);
        for await (const dependency of dependencies) {
            fileList.push(dependency.fileName);
            const actualParameters = [...parameters, dependency.fileName];
            const result = await this.doGeneration(actualParameters, spawnOptions, errorParser, options.outputDir);
            if (result.length > 0) {
                message += "\n" + result;
            }
        }
        if (message.length > 0) {
            throw new Error(message);
        }
        return fileList;
    }
    getATNGraph(rule) {
        const isLexerRule = rule[0] === rule[0].toUpperCase();
        if ((isLexerRule && !this.grammarLexerData) || (!isLexerRule && !this.grammarParserData)) {
            return;
        }
        const ruleIndexMap = isLexerRule ? this.grammarLexerRuleMap : this.grammarParserRuleMap;
        if (!ruleIndexMap.has(rule)) {
            return;
        }
        const ruleIndex = ruleIndexMap.get(rule);
        const atn = isLexerRule ? this.grammarLexerData.atn : this.grammarParserData.atn;
        const ruleNames = isLexerRule ? this.grammarLexerData.ruleNames : this.grammarParserData.ruleNames;
        const vocabulary = isLexerRule ? this.grammarLexerData.vocabulary : this.grammarParserData.vocabulary;
        const startState = atn.ruleToStartState[ruleIndex];
        const stopState = atn.ruleToStopState[ruleIndex];
        const lexerPredicates = this.listActions(types_1.CodeActionType.LexerPredicate);
        const parserPredicates = this.listActions(types_1.CodeActionType.ParserPredicate);
        const seenStates = new Set([startState]);
        const pipeline = [startState];
        const nodes = [];
        const links = [];
        const stateToIndex = new Map();
        let currentRuleIndex = -1;
        const ensureATNNode = (id, state) => {
            let index = stateToIndex.get(id);
            if (index === undefined) {
                const transitions = state.getTransitions();
                index = nodes.length;
                stateToIndex.set(id, index);
                nodes.push({
                    id,
                    name: id.toString(),
                    type: state.stateType,
                });
                if (transitions.length === 1 && transitions[0].target.stateType === atn_1.ATNStateType.RULE_START) {
                    const marker = state.stateNumber * transitions[0].target.stateNumber;
                    stateToIndex.set(marker, index + 1);
                    nodes.push({
                        id: currentRuleIndex--,
                        name: ruleNames[transitions[0].target.ruleIndex],
                        type: atn_1.ATNStateType.INVALID_TYPE,
                    });
                }
            }
            return index;
        };
        while (pipeline.length > 0) {
            const state = pipeline.shift();
            const sourceIndex = ensureATNNode(state.stateNumber, state);
            for (const transition of state.getTransitions()) {
                if (state === stopState) {
                    continue;
                }
                const transitsToRule = transition.target.stateType === atn_1.ATNStateType.RULE_START;
                const marker = transition.target.stateNumber * (transitsToRule ? state.stateNumber : 1);
                const targetIndex = ensureATNNode(marker, transition.target);
                const labels = [];
                const link = {
                    source: sourceIndex,
                    target: targetIndex,
                    type: transition.serializationType,
                    labels,
                };
                switch (transition.serializationType) {
                    case 1: {
                        break;
                    }
                    case 2: {
                        labels.push({ content: "Range Transition", class: "heading" });
                        break;
                    }
                    case 3: {
                        labels.push({ content: "Rule Transition", class: "heading" });
                        break;
                    }
                    case 4: {
                        const predicateTransition = transition;
                        const index = predicateTransition.predIndex;
                        labels.push({
                            content: `Predicate Transition (${index})`,
                            class: "heading",
                        });
                        let predicateText;
                        if (isLexerRule) {
                            const symbol = lexerPredicates[index];
                            predicateText = symbol.description;
                        }
                        else {
                            const symbol = parserPredicates[index];
                            predicateText = symbol.description;
                        }
                        if (predicateText) {
                            labels.push({
                                content: predicateText,
                                class: "predicate",
                            });
                        }
                        break;
                    }
                    case 5: {
                        labels.push({ content: "Atom Transition", class: "heading" });
                        break;
                    }
                    case 6: {
                        const actionTransition = transition;
                        const index = actionTransition.actionIndex === 0xFFFF ? -1 : actionTransition.actionIndex;
                        if (isLexerRule) {
                            labels.push({ content: `Lexer Action (${index})`, class: "action" });
                        }
                        else {
                            labels.push({ content: "Parser Action", class: "action" });
                        }
                        break;
                    }
                    case 7: {
                        labels.push({ content: "Set Transition", class: "heading" });
                        break;
                    }
                    case 8: {
                        labels.push({ content: "Not-Set Transition", class: "heading" });
                        break;
                    }
                    case 9: {
                        labels.push({ content: "Wildcard Transition", class: "heading" });
                        break;
                    }
                    case 10: {
                        const precedenceTransition = transition;
                        labels.push({
                            content: `Precedence Predicate (${precedenceTransition.precedence})`,
                            class: "heading",
                        });
                        break;
                    }
                    default: {
                        break;
                    }
                }
                if (transition.serializationType !== 4) {
                    if (transition.isEpsilon) {
                        labels.push({ content: "ε" });
                    }
                    else if (transition.label) {
                        if (isLexerRule) {
                            this.intervalSetToStrings(transition.label).forEach((value) => {
                                labels.push({ content: value });
                            });
                        }
                        else {
                            for (const label of transition.label.toArray()) {
                                labels.push({ content: vocabulary.getDisplayName(label) });
                            }
                        }
                    }
                    else {
                        labels.push({ content: "∀" });
                    }
                }
                links.push(link);
                let nextState;
                if (transitsToRule) {
                    nextState = transition.followState;
                    const returnIndex = ensureATNNode(nextState.stateNumber, nextState);
                    const nodeLink = {
                        source: targetIndex,
                        target: returnIndex,
                        type: 3,
                        labels: [{ content: "ε" }],
                    };
                    links.push(nodeLink);
                }
                else {
                    nextState = transition.target;
                }
                if (seenStates.has(nextState)) {
                    continue;
                }
                seenStates.add(nextState);
                pipeline.push(nextState);
            }
        }
        return {
            links,
            nodes,
        };
    }
    generateSentence(dependencies, rule, options, callback) {
        if (!this.isInterpreterDataLoaded) {
            callback("[No grammar data available]", 0);
            return;
        }
        if (rule.length === 0) {
            callback("[No rule specified]", 0);
            return;
        }
        const isLexerRule = rule[0] === rule[0].toUpperCase();
        let lexerData;
        let parserData;
        switch (this.info.type) {
            case types_1.GrammarType.Combined: {
                lexerData = this.grammarLexerData;
                parserData = this.grammarParserData;
                break;
            }
            case types_1.GrammarType.Lexer: {
                lexerData = this.grammarLexerData;
                break;
            }
            case types_1.GrammarType.Parser: {
                for (const dependency of dependencies) {
                    if (dependency.info.type === types_1.GrammarType.Lexer) {
                        lexerData = dependency.grammarLexerData;
                        break;
                    }
                }
                parserData = this.grammarParserData;
                break;
            }
            default: {
                break;
            }
        }
        if (!lexerData) {
            callback("[No lexer data available]", 0);
            return;
        }
        if (!isLexerRule && !parserData) {
            callback("[No parser data available]", 0);
            return;
        }
        let start;
        if (isLexerRule) {
            const index = this.grammarLexerRuleMap.get(rule);
            if (index === undefined) {
                callback("[Virtual or undefined token]", 0);
                return;
            }
            start = lexerData.atn.ruleToStartState[index];
        }
        else {
            const index = this.grammarParserRuleMap.get(rule);
            if (index === undefined) {
                callback("[Undefined rule]", 0);
                return;
            }
            start = parserData.atn.ruleToStartState[index];
        }
        try {
            const generator = new SentenceGenerator_1.SentenceGenerator(this, lexerData, parserData, options.actionFile);
            const count = Math.max(options.count ?? 1, 1);
            for (let i = 0; i < count; ++i) {
                callback(generator.generate(options, start), i);
            }
        }
        catch (e) {
            callback(String(e), 0);
        }
    }
    lexTestInput(input, actionFile) {
        const result = [];
        let error = "";
        if (this.grammarLexerData) {
            let predicateFunction;
            if (actionFile) {
                const code = fs.readFileSync(actionFile, { encoding: "utf-8" }) + `
                const runPredicate = (predicate) => eval(predicate);
                runPredicate;
                `;
                predicateFunction = vm.runInNewContext(code);
            }
            const stream = antlr4ts_1.CharStreams.fromString(input);
            const lexer = new GrammarInterpreters_1.GrammarLexerInterpreter(predicateFunction, this, "<unnamed>", this.grammarLexerData, stream);
            lexer.removeErrorListeners();
            lexer.addErrorListener(new GrammarInterpreters_1.InterpreterLexerErrorListener((event, ...args) => {
                error += args[0] + "\n";
                return true;
            }));
            const tokenStream = new antlr4ts_1.CommonTokenStream(lexer);
            tokenStream.fill();
            for (const token of tokenStream.getTokens()) {
                const name = lexer.vocabulary.getSymbolicName(token.type);
                result.push(name);
            }
        }
        return [result, error];
    }
    parseTestInput(input, startRule, actionFile) {
        const errors = [];
        if (!this.grammarLexerData || !this.grammarParserData) {
            return ["No interpreter data available"];
        }
        let predicateFunction;
        if (actionFile) {
            const code = fs.readFileSync(actionFile, { encoding: "utf-8" }) + `
            const runPredicate = (predicate) => eval(predicate);
            runPredicate;
            `;
            predicateFunction = vm.runInNewContext(code);
        }
        const eventSink = (event, ...args) => {
            errors.push(args[0]);
        };
        const stream = antlr4ts_1.CharStreams.fromString(input);
        const lexer = new GrammarInterpreters_1.GrammarLexerInterpreter(predicateFunction, this, "<unnamed>", this.grammarLexerData, stream);
        lexer.removeErrorListeners();
        lexer.addErrorListener(new GrammarInterpreters_1.InterpreterLexerErrorListener(eventSink));
        const tokenStream = new antlr4ts_1.CommonTokenStream(lexer);
        tokenStream.fill();
        const parser = new GrammarInterpreters_1.GrammarParserInterpreter(eventSink, predicateFunction, this, this.grammarParserData, tokenStream);
        parser.buildParseTree = true;
        parser.removeErrorListeners();
        parser.addErrorListener(new GrammarInterpreters_1.InterpreterParserErrorListener(eventSink));
        const startRuleIndex = parser.getRuleIndex(startRule);
        parser.parse(startRuleIndex);
        return errors;
    }
    getSymbolInfo(symbol) {
        return this.symbolTable.getSymbolInfo(symbol);
    }
    resolveSymbol(symbolName) {
        return this.symbolTable.resolveSync(symbolName, false);
    }
    formatGrammar(options, start, stop) {
        this.tokenStream.fill();
        const tokens = this.tokenStream.getTokens();
        const formatter = new Formatter_1.GrammarFormatter(tokens);
        return formatter.formatGrammar(options, start, stop);
    }
    setupInterpreters(outputDir) {
        let lexerInterpreterDataFile = "";
        let parserInterpreterDataFile = "";
        const baseName = (this.fileName.endsWith(".g4")
            ? path.basename(this.fileName, ".g4")
            : path.basename(this.fileName, ".g"));
        const grammarPath = (outputDir) ? outputDir : path.dirname(this.fileName);
        switch (this.info.type) {
            case types_1.GrammarType.Combined: {
                parserInterpreterDataFile = path.join(grammarPath, baseName) + ".interp";
                lexerInterpreterDataFile = path.join(grammarPath, baseName) + "Lexer.interp";
                break;
            }
            case types_1.GrammarType.Lexer: {
                lexerInterpreterDataFile = path.join(grammarPath, baseName) + ".interp";
                break;
            }
            case types_1.GrammarType.Parser: {
                parserInterpreterDataFile = path.join(grammarPath, baseName) + ".interp";
                break;
            }
            default:
                break;
        }
        let errors = "";
        if (fs.existsSync(lexerInterpreterDataFile)) {
            try {
                this.grammarLexerData = InterpreterDataReader_1.InterpreterDataReader.parseFile(lexerInterpreterDataFile);
                const map = new Map();
                for (let i = 0; i < this.grammarLexerData.ruleNames.length; ++i) {
                    map.set(this.grammarLexerData.ruleNames[i], i);
                }
                this.grammarLexerRuleMap = map;
            }
            catch (error) {
                errors +=
                    `Error while reading lexer interpreter data (${lexerInterpreterDataFile}): ${String(error)}\n`;
            }
        }
        else {
            this.grammarLexerData = undefined;
            this.grammarLexerRuleMap.clear();
        }
        if (fs.existsSync(parserInterpreterDataFile)) {
            try {
                this.grammarParserData = InterpreterDataReader_1.InterpreterDataReader.parseFile(parserInterpreterDataFile);
                const map = new Map();
                for (let i = 0; i < this.grammarParserData.ruleNames.length; ++i) {
                    map.set(this.grammarParserData.ruleNames[i], i);
                }
                this.grammarParserRuleMap = map;
            }
            catch (error) {
                errors +=
                    `Error while reading parser interpreter data (${lexerInterpreterDataFile}): ${String(error)}\n`;
            }
        }
        else {
            this.grammarParserData = undefined;
            this.grammarParserRuleMap.clear();
        }
        return errors;
    }
    doGeneration(parameters, spawnOptions, errorParser, outputDir) {
        return new Promise((resolve, reject) => {
            const java = child_process.spawn("java", parameters, spawnOptions);
            java.on("error", (error) => {
                resolve(`Error while running Java: "${error.message}". Is Java installed on you machine?`);
            });
            let buffer = "";
            java.stderr.on("data", (data) => {
                let text = data.toString();
                if (text.startsWith("Picked up _JAVA_OPTIONS:")) {
                    const endOfInfo = text.indexOf("\n");
                    if (endOfInfo === -1) {
                        text = "";
                    }
                    else {
                        text = text.substring(endOfInfo + 1);
                    }
                }
                if (text.length > 0) {
                    buffer += "\n" + text;
                }
            });
            java.on("close", (_code) => {
                const flag = errorParser.convertErrorsToDiagnostics(buffer);
                if (flag) {
                    resolve(this.setupInterpreters(outputDir));
                }
                else {
                    reject(buffer);
                }
            });
        });
    }
    runSemanticAnalysisIfNeeded() {
        if (!this.semanticAnalysisDone) {
            this.semanticAnalysisDone = true;
            this.rrdScripts = new Map();
            const semanticListener = new SemanticListener_1.SemanticListener(this.diagnostics, this.symbolTable);
            tree_1.ParseTreeWalker.DEFAULT.walk(semanticListener, this.tree);
            const visitor = new RuleVisitor_1.RuleVisitor(this.rrdScripts);
            visitor.visit(this.tree);
        }
    }
    intervalSetToStrings(set) {
        const result = [];
        const characterRepresentation = (char) => {
            if (char < 0) {
                return "EOF";
            }
            if (SourceContext.printableChars.contains(char)) {
                return "'" + String.fromCharCode(char) + "'";
            }
            const value = char.toString(16).toUpperCase();
            return "\\u" + "0".repeat(4 - value.length) + value;
        };
        for (const interval of set.intervals) {
            let entry = characterRepresentation(interval.a);
            if (interval.a !== interval.b) {
                entry += " - " + characterRepresentation(interval.b);
            }
            result.push(entry);
        }
        return result;
    }
    static {
        void (0, Unicode_1.printableUnicodePoints)({}).then((intervalSet) => {
            this.printableChars = intervalSet;
        });
    }
}
exports.SourceContext = SourceContext;
//# sourceMappingURL=SourceContext.js.map
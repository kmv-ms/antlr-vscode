"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetailsListener = void 0;
const ANTLRv4Parser_1 = require("../parser/ANTLRv4Parser");
const ContextSymbolTable_1 = require("./ContextSymbolTable");
const SourceContext_1 = require("./SourceContext");
const antlr4_c3_1 = require("antlr4-c3");
const ANTLRv4Lexer_1 = require("../parser/ANTLRv4Lexer");
const unquote = (input, quoteChar) => {
    quoteChar = quoteChar || '"';
    if (input[0] === quoteChar && input[input.length - 1] === quoteChar) {
        return input.slice(1, input.length - 1);
    }
    return input;
};
class DetailsListener {
    symbolTable;
    imports;
    symbolStack = [];
    constructor(symbolTable, imports) {
        this.symbolTable = symbolTable;
        this.imports = imports;
    }
    get ruleName() {
        return this.symbolStack.length === 0 ? "" : this.symbolStack[0].name;
    }
    enterParserRuleSpec(ctx) {
        this.pushNewSymbol(ContextSymbolTable_1.RuleSymbol, ctx, ctx.RULE_REF().text);
    }
    exitParserRuleSpec(_ctx) {
        this.popSymbol();
    }
    enterRuleBlock(ctx) {
        this.pushNewSymbol(antlr4_c3_1.BlockSymbol, ctx, "");
    }
    exitRuleBlock() {
        this.popSymbol();
    }
    enterLexerRuleSpec(ctx) {
        if (ctx.FRAGMENT()) {
            this.pushNewSymbol(ContextSymbolTable_1.FragmentTokenSymbol, ctx, ctx.TOKEN_REF().text);
        }
        else {
            this.pushNewSymbol(ContextSymbolTable_1.TokenSymbol, ctx, ctx.TOKEN_REF().text);
        }
    }
    exitLexerRuleSpec() {
        this.popSymbol();
    }
    enterLexerRuleBlock(ctx) {
        this.pushNewSymbol(antlr4_c3_1.BlockSymbol, ctx, "");
    }
    exitLexerRuleBlock(_ctx) {
        this.popSymbol();
    }
    enterBlock(ctx) {
        this.pushNewSymbol(antlr4_c3_1.BlockSymbol, ctx, "");
    }
    exitBlock(_ctx) {
        this.popSymbol();
    }
    enterAlternative(ctx) {
        this.pushNewSymbol(ContextSymbolTable_1.AlternativeSymbol, ctx, "");
    }
    exitAlternative(_ctx) {
        this.popSymbol();
    }
    enterLexerAlt(ctx) {
        this.pushNewSymbol(ContextSymbolTable_1.AlternativeSymbol, ctx, "");
    }
    exitLexerAlt(_ctx) {
        this.popSymbol();
    }
    exitTokensSpec(ctx) {
        const idList = ctx.idList();
        if (idList) {
            for (const identifier of idList.identifier()) {
                this.addNewSymbol(ContextSymbolTable_1.VirtualTokenSymbol, ctx, identifier.text);
            }
        }
    }
    exitChannelsSpec(ctx) {
        const idList = ctx.idList();
        if (idList) {
            for (const identifier of idList.identifier()) {
                this.addNewSymbol(ContextSymbolTable_1.TokenChannelSymbol, ctx, identifier.text);
            }
        }
    }
    exitTerminalRule(ctx) {
        let token = ctx.TOKEN_REF();
        if (token) {
            this.addNewSymbol(ContextSymbolTable_1.TokenReferenceSymbol, ctx, token.text);
        }
        else {
            token = ctx.STRING_LITERAL();
            if (token) {
                const refName = unquote(token.text, "'");
                this.addNewSymbol(antlr4_c3_1.LiteralSymbol, token, refName, refName);
            }
        }
    }
    exitRuleref(ctx) {
        const token = ctx.RULE_REF();
        if (token) {
            this.addNewSymbol(ContextSymbolTable_1.RuleReferenceSymbol, ctx, token.text);
        }
    }
    exitModeSpec(ctx) {
        this.addNewSymbol(ContextSymbolTable_1.LexerModeSymbol, ctx, ctx.identifier().text);
    }
    exitDelegateGrammar(ctx) {
        const context = ctx.identifier()[ctx.identifier().length - 1];
        if (context) {
            const name = SourceContext_1.SourceContext.definitionForContext(context, false).text;
            this.addNewSymbol(ContextSymbolTable_1.ImportSymbol, context, name);
            this.imports.push(name);
        }
    }
    enterOptionsSpec(ctx) {
        this.pushNewSymbol(ContextSymbolTable_1.OptionsSymbol, ctx, "options");
    }
    exitOptionsSpec(_ctx) {
        this.popSymbol();
    }
    exitOption(ctx) {
        const option = ctx.identifier().text;
        const valueContext = ctx.tryGetRuleContext(0, ANTLRv4Parser_1.OptionValueContext);
        if (valueContext && valueContext.childCount > 0) {
            const symbol = this.addNewSymbol(ContextSymbolTable_1.OptionSymbol, valueContext.getChild(0), option);
            symbol.value = valueContext.text;
            if (option === "tokenVocab") {
                this.imports.push(valueContext.text);
            }
        }
    }
    exitActionBlock(ctx) {
        let run = ctx.parent;
        while (run) {
            switch (run.ruleIndex) {
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_optionValue: {
                    return;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_namedAction: {
                    const localContext = run;
                    let prefix = "";
                    const actionScopeName = localContext.actionScopeName();
                    if (actionScopeName) {
                        prefix = actionScopeName.text + "::";
                    }
                    const symbol = this.addNewSymbol(ContextSymbolTable_1.GlobalNamedActionSymbol, ctx, prefix + localContext.identifier().text);
                    this.symbolTable.defineNamedAction(symbol);
                    return;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_exceptionHandler: {
                    this.addNewSymbol(ContextSymbolTable_1.ExceptionActionSymbol, ctx);
                    return;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_finallyClause: {
                    this.addNewSymbol(ContextSymbolTable_1.FinallyActionSymbol, ctx);
                    return;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_ruleAction: {
                    const symbol = this.addNewSymbol(ContextSymbolTable_1.LocalNamedActionSymbol, ctx, this.ruleName);
                    this.symbolTable.defineNamedAction(symbol);
                    return;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_lexerElement: {
                    const localContext = run;
                    if (localContext.QUESTION()) {
                        const symbol = this.addNewSymbol(ContextSymbolTable_1.LexerPredicateSymbol, ctx);
                        this.symbolTable.definePredicate(symbol);
                    }
                    else {
                        const symbol = this.addNewSymbol(ContextSymbolTable_1.LexerActionSymbol, ctx);
                        this.symbolTable.defineLexerAction(symbol);
                    }
                    return;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_element: {
                    const localContext = run;
                    if (localContext.QUESTION()) {
                        const symbol = this.addNewSymbol(ContextSymbolTable_1.ParserPredicateSymbol, ctx);
                        this.symbolTable.definePredicate(symbol);
                    }
                    else {
                        const symbol = this.addNewSymbol(ContextSymbolTable_1.ParserActionSymbol, ctx);
                        this.symbolTable.defineParserAction(symbol);
                    }
                    return;
                }
                default: {
                    run = run.parent;
                    break;
                }
            }
        }
    }
    exitArgActionBlock(ctx) {
        if (this.symbolStack.length === 0) {
            return;
        }
        let run = ctx.parent;
        while (run && run !== this.symbolStack[0].context) {
            run = run.parent;
        }
        if (run) {
            switch (run.ruleIndex) {
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_exceptionHandler: {
                    this.addNewSymbol(ContextSymbolTable_1.ArgumentSymbol, ctx, "exceptionHandler");
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_finallyClause: {
                    this.addNewSymbol(ContextSymbolTable_1.ArgumentSymbol, ctx, "finallyClause");
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_ruleReturns: {
                    this.addNewSymbol(ContextSymbolTable_1.ArgumentSymbol, ctx, "ruleReturns");
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_localsSpec: {
                    this.addNewSymbol(ContextSymbolTable_1.ArgumentSymbol, ctx, "localsSpec");
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_ruleref: {
                    this.addNewSymbol(ContextSymbolTable_1.ArgumentSymbol, ctx, "ruleRef");
                    break;
                }
                case ANTLRv4Parser_1.ANTLRv4Parser.RULE_parserRuleSpec: {
                    this.addNewSymbol(ContextSymbolTable_1.ArgumentSymbol, ctx, "parserRuleSpec");
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }
    exitEbnfSuffix(ctx) {
        this.addNewSymbol(ContextSymbolTable_1.EbnfSuffixSymbol, ctx, ctx.text);
    }
    enterLexerCommand(ctx) {
        this.pushNewSymbol(ContextSymbolTable_1.LexerCommandSymbol, ctx, ctx.lexerCommandName().text);
    }
    exitLexerCommand(_ctx) {
        this.popSymbol();
    }
    exitLabeledElement(ctx) {
        this.addNewSymbol(antlr4_c3_1.VariableSymbol, ctx, ctx.identifier().text);
    }
    visitTerminal = (node) => {
        if (this.currentSymbol() instanceof ContextSymbolTable_1.LexerCommandSymbol) {
            return;
        }
        switch (node.symbol.type) {
            case ANTLRv4Lexer_1.ANTLRv4Lexer.COLON:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.COLONCOLON:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.COMMA:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.LPAREN:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.RPAREN:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.LBRACE:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.RBRACE:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.RARROW:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.LT:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.GT:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.ASSIGN:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.QUESTION:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.STAR:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.PLUS_ASSIGN:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.PLUS:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.OR:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.DOLLAR:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.RANGE:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.DOT:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.AT:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.POUND:
            case ANTLRv4Lexer_1.ANTLRv4Lexer.NOT: {
                this.addNewSymbol(ContextSymbolTable_1.OperatorSymbol, node, node.text);
                break;
            }
            default: {
                break;
            }
        }
    };
    currentSymbol() {
        if (this.symbolStack.length === 0) {
            return undefined;
        }
        return this.symbolStack[this.symbolStack.length - 1];
    }
    addNewSymbol(type, context, ...args) {
        const symbol = this.symbolTable.addNewSymbolOfType(type, this.currentSymbol(), ...args);
        symbol.context = context;
        return symbol;
    }
    pushNewSymbol(type, context, ...args) {
        const symbol = this.symbolTable.addNewSymbolOfType(type, this.currentSymbol(), ...args);
        symbol.context = context;
        this.symbolStack.push(symbol);
        return symbol;
    }
    popSymbol() {
        return this.symbolStack.pop();
    }
}
exports.DetailsListener = DetailsListener;
//# sourceMappingURL=DetailsListener.js.map
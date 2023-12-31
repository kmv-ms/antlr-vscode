"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterpreterParserErrorListener = exports.InterpreterLexerErrorListener = exports.GrammarParserInterpreter = exports.GrammarLexerInterpreter = exports.RunMode = void 0;
const antlr4ts_1 = require("antlr4ts");
const atn_1 = require("antlr4ts/atn");
const tree_1 = require("antlr4ts/tree");
const antlr4_c3_1 = require("antlr4-c3");
const ContextSymbolTable_1 = require("./ContextSymbolTable");
const ANTLRv4Parser_1 = require("../parser/ANTLRv4Parser");
var RunMode;
(function (RunMode) {
    RunMode[RunMode["Normal"] = 0] = "Normal";
    RunMode[RunMode["StepIn"] = 1] = "StepIn";
    RunMode[RunMode["StepOver"] = 2] = "StepOver";
    RunMode[RunMode["StepOut"] = 3] = "StepOut";
})(RunMode = exports.RunMode || (exports.RunMode = {}));
class GrammarLexerInterpreter extends antlr4ts_1.LexerInterpreter {
    runPredicate;
    mainContext;
    predicates;
    constructor(runPredicate, mainContext, grammarFileName, lexerData, input) {
        super(grammarFileName, lexerData.vocabulary, lexerData.ruleNames, lexerData.channels, lexerData.modes, lexerData.atn, input);
        this.runPredicate = runPredicate;
        this.mainContext = mainContext;
        this.mainContext.symbolTable.getNestedSymbolsOfType(ContextSymbolTable_1.LexerPredicateSymbol).then((symbols) => {
            this.predicates = symbols;
        }).catch(() => {
            this.predicates = [];
        });
    }
    sempred(_localctx, ruleIndex, predIndex) {
        if (this.runPredicate) {
            if (predIndex < this.predicates.length) {
                let predicate = this.predicates[predIndex].context.text;
                if (predicate.length > 2) {
                    predicate = predicate.substring(1, predicate.length - 2);
                    try {
                        return this.runPredicate(predicate);
                    }
                    catch (e) {
                        throw Error(`There was an error while evaluating predicate "${predicate}". ` +
                            "Evaluation returned: " + String(e));
                    }
                }
            }
        }
        return true;
    }
}
exports.GrammarLexerInterpreter = GrammarLexerInterpreter;
class GrammarParserInterpreter extends antlr4ts_1.ParserInterpreter {
    eventSink;
    runPredicate;
    mainContext;
    breakPoints = new Set();
    callStack;
    pauseRequested = false;
    startIsPrecedenceRule;
    predicates;
    constructor(eventSink, runPredicate, mainContext, parserData, input) {
        super(mainContext.fileName, parserData.vocabulary, parserData.ruleNames, parserData.atn, input);
        this.eventSink = eventSink;
        this.runPredicate = runPredicate;
        this.mainContext = mainContext;
        this.mainContext.symbolTable.getNestedSymbolsOfType(ContextSymbolTable_1.ParserPredicateSymbol).then((symbols) => {
            this.predicates = symbols;
        }).catch(() => {
            this.predicates = [];
        });
    }
    start(startRuleIndex) {
        this.pauseRequested = false;
        this.callStack = [];
        const startRuleStartState = this.atn.ruleToStartState[startRuleIndex];
        this._rootContext = this.createInterpreterRuleContext(undefined, atn_1.ATNState.INVALID_STATE_NUMBER, startRuleIndex);
        if (startRuleStartState.isPrecedenceRule) {
            this.enterRecursionRule(this.rootContext, startRuleStartState.stateNumber, startRuleIndex, 0);
        }
        else {
            this.enterRule(this.rootContext, startRuleStartState.stateNumber, startRuleIndex);
        }
        this.startIsPrecedenceRule = startRuleStartState.isPrecedenceRule;
        return this.rootContext;
    }
    continue(runMode) {
        const stackDepth = this.callStack.length;
        let p = this.atnState;
        if (p.transition(0).serializationType !== 3 && runMode === RunMode.StepOver) {
            runMode = RunMode.StepIn;
        }
        let breakPointPending = false;
        while (true) {
            if (this.pauseRequested) {
                this.pauseRequested = false;
                runMode = RunMode.StepIn;
            }
            if (this.breakPoints.has(p) && p.stateType !== atn_1.ATNStateType.RULE_STOP) {
                breakPointPending = true;
                runMode = RunMode.StepIn;
            }
            switch (p.stateType) {
                case atn_1.ATNStateType.RULE_STOP: {
                    if (this._ctx.isEmpty) {
                        if (this.startIsPrecedenceRule) {
                            const result = this._ctx;
                            const parentContext = this._parentContextStack.pop();
                            this.unrollRecursionContexts(parentContext[0]);
                            this.eventSink("end");
                            return result;
                        }
                        else {
                            this.exitRule();
                            this.eventSink("end");
                            return this.rootContext;
                        }
                    }
                    this.callStack.pop();
                    this.visitRuleStopState(p);
                    if ((runMode === RunMode.StepOut && stackDepth === this.callStack.length + 1)
                        || (runMode === RunMode.StepOver && stackDepth === this.callStack.length)) {
                        runMode = RunMode.StepIn;
                    }
                    break;
                }
                case atn_1.ATNStateType.RULE_START: {
                    const ruleName = this.ruleNameFromIndex(this.atnState.ruleIndex);
                    if (ruleName) {
                        const ruleSymbol = this.mainContext.resolveSymbol(ruleName);
                        if (ruleSymbol) {
                            const st = ruleSymbol.symbolTable;
                            this.callStack.push({
                                name: ruleName,
                                current: [ruleSymbol],
                                next: [ruleSymbol],
                                source: st.owner ? st.owner.fileName : undefined,
                            });
                        }
                        else {
                            throw new Error("Cannot find rule \"" + ruleName + "\" - debugging aborted.");
                        }
                    }
                }
                default: {
                    try {
                        this.visitState(p);
                    }
                    catch (e) {
                        if (e instanceof antlr4ts_1.RecognitionException) {
                            this.state = this._atn.ruleToStopState[p.ruleIndex].stateNumber;
                            this.context.exception = e;
                            this.errorHandler.reportError(this, e);
                            this.recover(e);
                        }
                        else {
                            throw e;
                        }
                    }
                    break;
                }
            }
            p = this.atnState;
            if (p.numberOfTransitions === 1) {
                const transition = p.transition(0);
                switch (transition.serializationType) {
                    case 3:
                    case 5:
                    case 8:
                    case 2:
                    case 7:
                    case 9: {
                        const lastStackFrame = this.callStack[this.callStack.length - 1];
                        lastStackFrame.current = lastStackFrame.next;
                        this.computeNextSymbols(lastStackFrame, transition);
                        if (runMode === RunMode.StepIn) {
                            if (breakPointPending) {
                                this.eventSink("stopOnBreakpoint");
                            }
                            else {
                                this.eventSink("stopOnStep");
                            }
                            return this.rootContext;
                        }
                        break;
                    }
                    case 1: {
                        if (transition.target.stateType === atn_1.ATNStateType.RULE_STOP) {
                            const isBreakPoint = this.breakPoints.has(transition.target);
                            if (runMode === RunMode.StepIn || isBreakPoint) {
                                const lastStackFrame = this.callStack[this.callStack.length - 1];
                                lastStackFrame.current = lastStackFrame.next;
                                this.computeNextSymbols(lastStackFrame, transition);
                                if (isBreakPoint) {
                                    this.eventSink("stopOnBreakpoint");
                                }
                                else {
                                    this.eventSink("stopOnStep");
                                }
                                return this.rootContext;
                            }
                        }
                        break;
                    }
                    default:
                }
            }
        }
    }
    sempred(_localctx, ruleIndex, predIndex) {
        if (this.runPredicate) {
            if (predIndex < this.predicates.length) {
                let predicate = this.predicates[predIndex].context.text;
                if (predicate.length > 2) {
                    predicate = predicate.substr(1, predicate.length - 2);
                    try {
                        return this.runPredicate(predicate);
                    }
                    catch (e) {
                        throw Error(`There was an error while evaluating predicate "${predicate}". ` +
                            "Evaluation returned: " + String(e));
                    }
                }
            }
        }
        return true;
    }
    action(_localctx, _ruleIndex, _actionIndex) {
    }
    ruleNameFromIndex(ruleIndex) {
        if (ruleIndex < 0 || ruleIndex >= this.ruleNames.length) {
            return;
        }
        return this.ruleNames[ruleIndex];
    }
    computeNextSymbols(frame, transition) {
        frame.next = [];
        const terminalMatches = (node) => {
            const type = this.tokenIndexFromName(node.symbol.text);
            const currentType = this.inputStream.LA(1);
            if (type === currentType
                && transition.matches(currentType, antlr4ts_1.Lexer.MIN_CHAR_VALUE, antlr4ts_1.Lexer.MAX_CHAR_VALUE)) {
                return true;
            }
            return false;
        };
        for (const source of frame.current) {
            const candidates = this.nextCandidates(source);
            for (const candidate of candidates) {
                if (candidate instanceof ContextSymbolTable_1.RuleReferenceSymbol) {
                    frame.next.push(candidate);
                }
                else {
                    if (candidate.name === ";") {
                        frame.next.push(candidate);
                    }
                    else if (candidate.context instanceof ANTLRv4Parser_1.TerminalRuleContext) {
                        if (candidate.context.TOKEN_REF()) {
                            if (terminalMatches(candidate.context.TOKEN_REF())) {
                                frame.next.push(candidate);
                            }
                        }
                    }
                    else if (candidate.context instanceof tree_1.TerminalNode) {
                        if (terminalMatches(candidate.context)) {
                            frame.next.push(candidate);
                        }
                    }
                }
            }
        }
    }
    nextCandidates(start) {
        const result = [];
        let next;
        if (start instanceof ContextSymbolTable_1.RuleSymbol) {
            next = start.children[1];
        }
        else {
            next = start.nextSibling;
            if (next instanceof ContextSymbolTable_1.EbnfSuffixSymbol) {
                switch (next.name[0]) {
                    case "?": {
                        next = next.nextSibling;
                        break;
                    }
                    case "+":
                    case "*": {
                        result.push(start);
                        next = next.nextSibling;
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
            else if (next instanceof antlr4_c3_1.VariableSymbol) {
                next = next.nextSibling;
                if (next) {
                    next = next.nextSibling;
                }
            }
            else if (next instanceof ContextSymbolTable_1.ParserActionSymbol || next instanceof ContextSymbolTable_1.LexerActionSymbol) {
                next = next.nextSibling;
            }
            else if (next instanceof ContextSymbolTable_1.ParserPredicateSymbol || next instanceof ContextSymbolTable_1.LexerPredicateSymbol) {
                next = next.nextSibling;
                if (next) {
                    next = next.nextSibling;
                }
            }
            if (!next) {
                let block = start;
                while (true) {
                    if (block.parent instanceof ContextSymbolTable_1.RuleSymbol && block.lastSibling) {
                        result.push(block.lastSibling);
                        return result;
                    }
                    block = block.parent.parent;
                    next = block.nextSibling;
                    if (next) {
                        if (next instanceof ContextSymbolTable_1.EbnfSuffixSymbol) {
                            switch (next.name[0]) {
                                case "?": {
                                    next = next.nextSibling;
                                    break;
                                }
                                case "+":
                                case "*": {
                                    result.push(...this.candidatesFromBlock(block));
                                    next = next.nextSibling;
                                    break;
                                }
                                default: {
                                    break;
                                }
                            }
                        }
                        if (next) {
                            break;
                        }
                    }
                }
            }
        }
        if (next instanceof antlr4_c3_1.BlockSymbol) {
            result.push(...this.candidatesFromBlock(next));
        }
        else {
            result.push(next);
        }
        next = next.nextSibling;
        if (next instanceof ContextSymbolTable_1.EbnfSuffixSymbol) {
            if (next.name[0] === "?" || next.name[0] === "*") {
                const subResult = this.nextCandidates(next);
                result.push(...subResult);
            }
        }
        return result;
    }
    candidatesFromBlock(block) {
        const result = [];
        for (const symbol of block.children) {
            let next = (symbol instanceof antlr4_c3_1.ScopedSymbol) ? symbol.firstChild : undefined;
            if (next instanceof antlr4_c3_1.VariableSymbol) {
                next = next.nextSibling;
                if (next) {
                    next = next.nextSibling;
                }
            }
            else if (next instanceof ContextSymbolTable_1.ParserActionSymbol || next instanceof ContextSymbolTable_1.LexerActionSymbol) {
                next = next.nextSibling;
            }
            else if (next instanceof ContextSymbolTable_1.ParserPredicateSymbol || next instanceof ContextSymbolTable_1.LexerPredicateSymbol) {
                next = next.nextSibling;
                if (next) {
                    next = next.nextSibling;
                }
            }
            if (next) {
                if (next instanceof antlr4_c3_1.BlockSymbol) {
                    result.push(...this.candidatesFromBlock(next));
                }
                else {
                    result.push(next);
                }
                next = next.nextSibling;
                if (next instanceof ContextSymbolTable_1.EbnfSuffixSymbol) {
                    if (next.name[0] === "?" || next.name[0] === "*") {
                        const subResult = this.nextCandidates(next);
                        result.push(...subResult);
                    }
                }
            }
        }
        return result;
    }
    tokenIndexFromName(tokenName) {
        const vocab = this.vocabulary;
        for (let i = 0; i <= vocab.maxTokenType; ++i) {
            if (vocab.getSymbolicName(i) === tokenName) {
                return i;
            }
        }
        for (let i = 0; i <= vocab.maxTokenType; ++i) {
            if (vocab.getLiteralName(i) === tokenName) {
                return i;
            }
        }
        return -1;
    }
}
exports.GrammarParserInterpreter = GrammarParserInterpreter;
class InterpreterLexerErrorListener {
    eventSink;
    constructor(eventSink) {
        this.eventSink = eventSink;
    }
    syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, _e) {
        this.eventSink("output", `Lexer error (${line}, ${charPositionInLine + 1}): ${msg}`, recognizer.inputStream.sourceName, line, charPositionInLine, true);
    }
}
exports.InterpreterLexerErrorListener = InterpreterLexerErrorListener;
class InterpreterParserErrorListener {
    eventSink;
    constructor(eventSink) {
        this.eventSink = eventSink;
    }
    syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, _e) {
        this.eventSink("output", `Parser error (${line}, ${charPositionInLine + 1}): ${msg}`, recognizer.inputStream.sourceName, line, charPositionInLine, true);
    }
}
exports.InterpreterParserErrorListener = InterpreterParserErrorListener;
//# sourceMappingURL=GrammarInterpreters.js.map
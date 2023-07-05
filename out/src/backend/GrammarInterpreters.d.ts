import { LexerInterpreter, ParserInterpreter, TokenStream, CommonToken, ParserRuleContext, RecognitionException, ANTLRErrorListener, Recognizer, Token, RuleContext, CharStream } from "antlr4ts";
import { ATNState, ATNSimulator } from "antlr4ts/atn";
import { BaseSymbol } from "antlr4-c3";
import { IInterpreterData } from "./InterpreterDataReader";
import { SourceContext } from "./SourceContext";
import { PredicateFunction } from "./types";
export declare enum RunMode {
    Normal = 0,
    StepIn = 1,
    StepOver = 2,
    StepOut = 3
}
export interface IInternalStackFrame {
    name: string;
    source?: string;
    current: BaseSymbol[];
    next: BaseSymbol[];
}
export declare class GrammarLexerInterpreter extends LexerInterpreter {
    private runPredicate;
    private mainContext;
    private predicates;
    constructor(runPredicate: PredicateFunction | undefined, mainContext: SourceContext, grammarFileName: string, lexerData: IInterpreterData, input: CharStream);
    sempred(_localctx: RuleContext | undefined, ruleIndex: number, predIndex: number): boolean;
}
export declare class GrammarParserInterpreter extends ParserInterpreter {
    private eventSink;
    private runPredicate;
    private mainContext;
    breakPoints: Set<ATNState>;
    callStack: IInternalStackFrame[];
    pauseRequested: boolean;
    private startIsPrecedenceRule;
    private predicates;
    constructor(eventSink: (event: string | symbol, ...args: unknown[]) => void, runPredicate: PredicateFunction | undefined, mainContext: SourceContext, parserData: IInterpreterData, input: TokenStream);
    start(startRuleIndex: number): ParserRuleContext;
    continue(runMode: RunMode): ParserRuleContext;
    sempred(_localctx: RuleContext | undefined, ruleIndex: number, predIndex: number): boolean;
    action(_localctx: RuleContext | undefined, _ruleIndex: number, _actionIndex: number): void;
    private ruleNameFromIndex;
    private computeNextSymbols;
    private nextCandidates;
    private candidatesFromBlock;
    private tokenIndexFromName;
}
export declare class InterpreterLexerErrorListener implements ANTLRErrorListener<number> {
    private eventSink;
    constructor(eventSink: (event: string | symbol, ...args: unknown[]) => void);
    syntaxError<T extends number>(recognizer: Recognizer<T, ATNSimulator>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, _e: RecognitionException | undefined): void;
}
export declare class InterpreterParserErrorListener implements ANTLRErrorListener<CommonToken> {
    private eventSink;
    constructor(eventSink: (event: string | symbol, ...args: unknown[]) => void);
    syntaxError<T extends Token>(recognizer: Recognizer<T, ATNSimulator>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, _e: RecognitionException | undefined): void;
}

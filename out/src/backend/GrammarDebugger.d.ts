/// <reference types="node" />
import { EventEmitter } from "events";
import { CommonToken, Lexer } from "antlr4ts";
import { ILexicalRange, IParseTreeNode } from "./types";
import { SourceContext } from "./SourceContext";
export interface IGrammarBreakPoint {
    source: string;
    validated: boolean;
    line: number;
    id: number;
}
export interface IGrammarStackFrame {
    name: string;
    source: string;
    next: ILexicalRange[];
}
export declare class GrammarDebugger extends EventEmitter {
    private contexts;
    private lexerData;
    private parserData;
    private lexer;
    private tokenStream;
    private parser;
    private parseTree;
    private breakPoints;
    private nextBreakPointId;
    constructor(contexts: SourceContext[], actionFile: string);
    get isValid(): boolean;
    start(startRuleIndex: number, input: string, noDebug: boolean): void;
    continue(): void;
    stepIn(): void;
    stepOut(): void;
    stepOver(): void;
    stop(): void;
    pause(): void;
    clearBreakPoints(): void;
    addBreakPoint(path: string, line: number): IGrammarBreakPoint;
    get tokenList(): CommonToken[];
    get errorCount(): number;
    get inputSize(): number;
    ruleNameFromIndex(ruleIndex: number): string | undefined;
    ruleIndexFromName(ruleName: string): number;
    get currentParseTree(): IParseTreeNode | undefined;
    get currentStackTrace(): IGrammarStackFrame[];
    get currentTokenIndex(): number;
    getStackInfo(index: number): string;
    getVariables(index: number): Promise<Array<[string, string]>>;
    tokenTypeName(token: CommonToken): string;
    get recognizer(): Lexer;
    private sendEvent;
    private parseContextToNode;
    private computeHash;
    private convertToken;
    private validateBreakPoint;
}

import { ANTLRErrorListener, Recognizer, RecognitionException, Token, CommonToken } from "antlr4ts";
import { IDiagnosticEntry } from "./types";
export declare class ContextErrorListener implements ANTLRErrorListener<CommonToken> {
    private errorList;
    constructor(errorList: IDiagnosticEntry[]);
    syntaxError<T extends Token>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, _e: RecognitionException | undefined): void;
}

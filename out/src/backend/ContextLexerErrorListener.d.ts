import { ANTLRErrorListener, Recognizer, RecognitionException } from "antlr4ts";
import { IDiagnosticEntry } from "./types";
export declare class ContextLexerErrorListener implements ANTLRErrorListener<number> {
    private errorList;
    constructor(errorList: IDiagnosticEntry[]);
    syntaxError<T extends number>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, _e: RecognitionException | undefined): void;
}

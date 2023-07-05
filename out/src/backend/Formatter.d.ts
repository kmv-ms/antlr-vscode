import { IFormattingOptions } from "./types";
import { Token } from "antlr4ts";
export declare class GrammarFormatter {
    private tokens;
    static readonly LineBreak = -2;
    static readonly Space = -3;
    static readonly Tab = -4;
    static readonly Undefined = 0;
    static readonly Whitespace = -100;
    static readonly Comment = -101;
    static readonly WhitespaceEraser = -102;
    static readonly Error = -103;
    static readonly Range = -100000;
    static readonly Alignment = -200000;
    static readonly WhitespaceBlock = -300000;
    private options;
    private outputPipeline;
    private currentIndentation;
    private formattingDisabled;
    private currentLine;
    private currentColumn;
    private singleLineBlockNesting;
    private ranges;
    private currentRangeIndex;
    private rangeStart;
    private alignments;
    private whitespaceList;
    constructor(tokens: Token[]);
    formatGrammar(options: IFormattingOptions, start: number, stop: number): [string, number, number];
    private setDefaultOptions;
    private entryIs;
    private lastEntryIs;
    private lineHasNonWhitespaceContent;
    private lastCodeTokenIs;
    private removeLastEntry;
    private removeTrailingTabsAndSpaces;
    private removeTrailingWhitespaces;
    private pushCurrentIndentation;
    private applyLineContinuation;
    private add;
    private tokenFromIndex;
    private computeLineLength;
    private addRaw;
    private addSpace;
    private addLineBreak;
    private ensureMinEmptyLines;
    private getBlockInfo;
    private nonBreakingTrailerAhead;
    private processFormattingCommands;
    private addAlignmentEntry;
    private computeAlignments;
    private columnForEntry;
    private reflowComment;
    private isRangeBlock;
    private isWhitespaceBlock;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrammarFormatter = void 0;
const antlr4ts_1 = require("antlr4ts");
const misc_1 = require("antlr4ts/misc");
const ANTLRv4Lexer_1 = require("../parser/ANTLRv4Lexer");
const formatIntroducer = "$antlr-format";
var AlignmentType;
(function (AlignmentType) {
    AlignmentType[AlignmentType["Colon"] = 0] = "Colon";
    AlignmentType[AlignmentType["FirstToken"] = 1] = "FirstToken";
    AlignmentType[AlignmentType["Label"] = 2] = "Label";
    AlignmentType[AlignmentType["LexerCommand"] = 3] = "LexerCommand";
    AlignmentType[AlignmentType["Action"] = 4] = "Action";
    AlignmentType[AlignmentType["TrailingComment"] = 5] = "TrailingComment";
    AlignmentType[AlignmentType["Trailers"] = 6] = "Trailers";
})(AlignmentType || (AlignmentType = {}));
const allAlignments = [
    AlignmentType.Colon, AlignmentType.FirstToken, AlignmentType.Label, AlignmentType.Action,
    AlignmentType.LexerCommand, AlignmentType.TrailingComment, AlignmentType.Trailers,
];
class GrammarFormatter {
    tokens;
    static LineBreak = -2;
    static Space = -3;
    static Tab = -4;
    static Undefined = 0;
    static Whitespace = -100;
    static Comment = -101;
    static WhitespaceEraser = -102;
    static Error = -103;
    static Range = -100000;
    static Alignment = -200000;
    static WhitespaceBlock = -300000;
    options;
    outputPipeline;
    currentIndentation;
    formattingDisabled;
    currentLine;
    currentColumn;
    singleLineBlockNesting;
    ranges;
    currentRangeIndex;
    rangeStart;
    alignments = new Map();
    whitespaceList;
    constructor(tokens) {
        this.tokens = tokens;
    }
    formatGrammar(options, start, stop) {
        if (this.tokens.length === 0) {
            return ["", -1, -1];
        }
        this.setDefaultOptions();
        this.options = Object.assign(this.options, options);
        if (this.options.columnLimit <= 0) {
            this.options.columnLimit = 1e30;
        }
        this.outputPipeline = [];
        this.currentIndentation = 0;
        this.singleLineBlockNesting = 0;
        this.ranges = [];
        this.currentRangeIndex = GrammarFormatter.Undefined;
        this.rangeStart = -1;
        this.alignments.clear();
        this.whitespaceList = [];
        this.currentColumn = 0;
        this.currentLine = 1;
        this.formattingDisabled = false;
        let coalesceWhitespaces = false;
        let inBraces = false;
        let inRule = false;
        let inNamedAction = false;
        let inLexerCommand = false;
        let inCatchFinally = false;
        let inSingleLineRule = false;
        let minLineInsertionPending = false;
        let startIndex = this.tokenFromIndex(start, true);
        const endIndex = this.tokenFromIndex(stop, false);
        if (this.options.reflowComments && this.tokens[startIndex].type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
            let runningIndex = startIndex;
            while (runningIndex > 0) {
                if (this.tokens[runningIndex--].text.indexOf(formatIntroducer) >= 0) {
                    break;
                }
                if (this.tokens[runningIndex].type !== ANTLRv4Lexer_1.ANTLRv4Lexer.WS
                    || this.tokens[runningIndex].line + 1 !== this.tokens[runningIndex + 1].line) {
                    break;
                }
                startIndex = runningIndex + 1;
                if (this.tokens[--runningIndex].type !== ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
                    break;
                }
            }
        }
        let targetStart = this.tokens[startIndex].startIndex;
        let startRow = this.tokens[startIndex].line;
        const targetStop = this.tokens[endIndex].stopIndex;
        targetStart -= this.tokens[startIndex].charPositionInLine;
        let run = startIndex;
        let done = false;
        while (run > 0 && !done) {
            switch (this.tokens[run].type) {
                case ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI: {
                    let localRun = run;
                    while (localRun-- > 0 && !done) {
                        switch (this.tokens[localRun].type) {
                            case ANTLRv4Lexer_1.ANTLRv4Lexer.LBRACE: {
                                if (this.tokens[localRun].line < startRow) {
                                    ++this.currentIndentation;
                                    inBraces = true;
                                }
                                localRun = startIndex;
                                let type = 0;
                                do {
                                    type = this.tokens[localRun].type;
                                    if (type !== ANTLRv4Lexer_1.ANTLRv4Lexer.WS
                                        && type !== ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT
                                        && type !== ANTLRv4Lexer_1.ANTLRv4Lexer.BLOCK_COMMENT
                                        && type !== ANTLRv4Lexer_1.ANTLRv4Lexer.DOC_COMMENT) {
                                        break;
                                    }
                                } while (localRun-- > 0);
                                coalesceWhitespaces = type !== ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI;
                                done = true;
                                break;
                            }
                            case ANTLRv4Lexer_1.ANTLRv4Lexer.BEGIN_ACTION:
                            case ANTLRv4Lexer_1.ANTLRv4Lexer.END_ACTION:
                            case ANTLRv4Lexer_1.ANTLRv4Lexer.COLON:
                            case ANTLRv4Lexer_1.ANTLRv4Lexer.COLONCOLON:
                            case ANTLRv4Lexer_1.ANTLRv4Lexer.OR: {
                                done = true;
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }
                    done = true;
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.COLON:
                    if (this.tokens[run].line < startRow) {
                        ++this.currentIndentation;
                        inRule = true;
                        coalesceWhitespaces = true;
                    }
                    done = true;
                    break;
                case ANTLRv4Lexer_1.ANTLRv4Lexer.AT:
                    startRow = this.tokens[run].line;
                    startIndex = run;
                    targetStart = this.tokens[run].startIndex;
                    done = true;
                    break;
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LBRACE:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.BEGIN_ACTION:
                    if (this.tokens[run].line < startRow) {
                        ++this.currentIndentation;
                        inBraces = true;
                    }
                    done = true;
                    break;
                case ANTLRv4Lexer_1.ANTLRv4Lexer.RBRACE:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.END_ACTION:
                    done = true;
                    break;
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LPAREN:
                    if (this.tokens[run].line < startRow) {
                        ++this.currentIndentation;
                    }
                    --run;
                    break;
                case ANTLRv4Lexer_1.ANTLRv4Lexer.RPAREN:
                    if (this.tokens[run].line < startRow) {
                        --this.currentIndentation;
                    }
                    --run;
                    break;
                default:
                    --run;
                    break;
            }
        }
        this.currentLine = startRow;
        this.pushCurrentIndentation();
        for (let i = startIndex; i <= endIndex; ++i) {
            const token = this.tokens[i];
            if (token.type !== ANTLRv4Lexer_1.ANTLRv4Lexer.WS && this.lastEntryIs(GrammarFormatter.WhitespaceEraser)) {
                this.outputPipeline.pop();
            }
            if (minLineInsertionPending && token.type !== ANTLRv4Lexer_1.ANTLRv4Lexer.WS && token.type !== ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
                minLineInsertionPending = false;
                this.ensureMinEmptyLines();
            }
            switch (token.type) {
                case ANTLRv4Lexer_1.ANTLRv4Lexer.WS: {
                    if (i === 0 || this.formattingDisabled) {
                        break;
                    }
                    const nextType = this.tokens[i + 1].type;
                    const localCommentAhead = (nextType === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT
                        || nextType === ANTLRv4Lexer_1.ANTLRv4Lexer.BLOCK_COMMENT || nextType === ANTLRv4Lexer_1.ANTLRv4Lexer.DOC_COMMENT);
                    if (this.lastEntryIs(GrammarFormatter.WhitespaceEraser)) {
                        this.outputPipeline.pop();
                        if (!localCommentAhead) {
                            break;
                        }
                    }
                    const text = token.text.replace("\r\n", "\n");
                    const hasLineBreaks = text.indexOf("\n") >= 0;
                    if (!localCommentAhead || !hasLineBreaks) {
                        if (!hasLineBreaks || coalesceWhitespaces || this.singleLineBlockNesting > 0) {
                            if (!this.lastEntryIs(GrammarFormatter.Whitespace)) {
                                this.addSpace();
                            }
                            break;
                        }
                    }
                    const parts = text.split("\n");
                    let breakCount = 0;
                    if (localCommentAhead && this.lastCodeTokenIs(ANTLRv4Lexer_1.ANTLRv4Lexer.LPAREN)
                        && !this.options.keepEmptyLinesAtTheStartOfBlocks) {
                        breakCount = 1;
                    }
                    else {
                        let j = this.outputPipeline.length - 1;
                        while (j >= 0) {
                            if (this.entryIs(j, GrammarFormatter.LineBreak)) {
                                ++breakCount;
                            }
                            else {
                                break;
                            }
                            --j;
                        }
                        breakCount = Math.max(breakCount, parts.length - 1);
                        breakCount = Math.min(breakCount, this.options.maxEmptyLinesToKeep + 1);
                    }
                    this.removeTrailingWhitespaces();
                    const lineBreaks = Array(breakCount).fill(GrammarFormatter.LineBreak);
                    this.outputPipeline.push(...lineBreaks);
                    this.currentLine += breakCount;
                    this.currentColumn = 0;
                    if (i < endIndex && minLineInsertionPending) {
                        minLineInsertionPending = false;
                        this.ensureMinEmptyLines();
                    }
                    this.pushCurrentIndentation();
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI: {
                    this.removeTrailingWhitespaces();
                    if (!inSingleLineRule) {
                        this.singleLineBlockNesting = 0;
                    }
                    const canAlignSemicolon = !inSingleLineRule || this.options.alignColons === "hanging";
                    if (canAlignSemicolon && !inBraces && inRule) {
                        switch (this.options.alignSemicolons) {
                            case "none": {
                                break;
                            }
                            case "ownLine": {
                                const forceNewLine = !this.options.singleLineOverrulesHangingColon
                                    && this.options.alignColons === "hanging";
                                this.addLineBreak(forceNewLine);
                                break;
                            }
                            case "hanging": {
                                this.addLineBreak();
                                this.pushCurrentIndentation();
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }
                    this.add(i);
                    if (!inBraces && this.currentIndentation > 0) {
                        --this.currentIndentation;
                    }
                    this.singleLineBlockNesting = 0;
                    inSingleLineRule = false;
                    if (this.currentIndentation === 0) {
                        minLineInsertionPending = true;
                    }
                    else {
                        this.addLineBreak();
                        this.pushCurrentIndentation();
                    }
                    coalesceWhitespaces = false;
                    inLexerCommand = false;
                    if (!inBraces) {
                        inRule = false;
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LBRACE: {
                    if (this.singleLineBlockNesting === 0 && this.options.breakBeforeBraces) {
                        this.removeTrailingWhitespaces();
                        this.addLineBreak();
                        this.pushCurrentIndentation();
                        this.add(i);
                    }
                    else {
                        this.removeTrailingWhitespaces();
                        this.addSpace();
                        this.add(i);
                    }
                    ++this.currentIndentation;
                    inBraces = true;
                    if (!this.nonBreakingTrailerAhead(i)) {
                        this.addLineBreak();
                        this.pushCurrentIndentation();
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.RBRACE: {
                    this.removeTrailingWhitespaces();
                    this.addLineBreak();
                    if (this.currentIndentation > 0) {
                        --this.currentIndentation;
                    }
                    this.pushCurrentIndentation();
                    this.add(i);
                    minLineInsertionPending = this.currentIndentation === 0;
                    inBraces = false;
                    coalesceWhitespaces = false;
                    inRule = false;
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.BEGIN_ACTION: {
                    if (this.formattingDisabled) {
                        break;
                    }
                    if (this.options.alignTrailers) {
                        this.addAlignmentEntry(AlignmentType.Trailers);
                    }
                    else if (this.options.alignActions) {
                        this.addAlignmentEntry(AlignmentType.Action);
                    }
                    this.add(i++);
                    if (inCatchFinally && this.tokens[i].text !== "\n") {
                        this.addLineBreak();
                    }
                    const actionStart = i;
                    while (i <= endIndex
                        && this.tokens[i].type !== antlr4ts_1.Token.EOF
                        && this.tokens[i].type !== ANTLRv4Lexer_1.ANTLRv4Lexer.END_ACTION) {
                        ++i;
                    }
                    this.addRaw(actionStart, i - 1);
                    if (i <= endIndex) {
                        if (inCatchFinally && this.tokens[i - 1].text !== "\n") {
                            this.addLineBreak();
                        }
                        this.add(i);
                        this.addSpace();
                        minLineInsertionPending = this.currentIndentation === 0;
                        if (!inRule) {
                            inNamedAction = false;
                            coalesceWhitespaces = false;
                        }
                        inCatchFinally = false;
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.BLOCK_COMMENT: {
                    this.processFormattingCommands(i);
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.DOC_COMMENT: {
                    const hasLineContent = this.lineHasNonWhitespaceContent();
                    let comment = token.text;
                    if (hasLineContent) {
                        if (token.type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
                            if (this.options.alignTrailers) {
                                this.addAlignmentEntry(AlignmentType.Trailers);
                            }
                            else if (this.options.alignTrailingComments) {
                                this.addAlignmentEntry(AlignmentType.TrailingComment);
                            }
                        }
                    }
                    else if (comment.indexOf(formatIntroducer) < 0
                        && this.options.reflowComments
                        && token.type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
                        while (true) {
                            let nextToken = this.tokens[i + 1];
                            if (nextToken.type === ANTLRv4Lexer_1.ANTLRv4Lexer.EOF) {
                                break;
                            }
                            const content = nextToken.text;
                            if (content.split("\n").length > 2) {
                                break;
                            }
                            nextToken = this.tokens[i + 2];
                            if (nextToken.type !== ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT
                                || nextToken.text.indexOf(formatIntroducer) >= 0) {
                                break;
                            }
                            comment += "\n" + nextToken.text;
                            i += 2;
                            this.processFormattingCommands(i);
                        }
                    }
                    if (this.options.reflowComments && comment.indexOf("\n") > 0) {
                        const formatted = this.reflowComment(comment, token.type);
                        const whitespaceIndex = GrammarFormatter.WhitespaceBlock - this.whitespaceList.length;
                        this.outputPipeline.push(whitespaceIndex);
                        this.whitespaceList.push(formatted);
                        for (const char of formatted) {
                            if (char === "\n") {
                                ++this.currentLine;
                            }
                        }
                        this.addLineBreak();
                        this.pushCurrentIndentation();
                    }
                    else {
                        this.add(i);
                        if (token.type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
                            if (this.currentIndentation > 0) {
                                this.addLineBreak();
                                this.pushCurrentIndentation();
                            }
                        }
                        else {
                            this.addSpace();
                        }
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.ASSIGN:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.PLUS_ASSIGN: {
                    if (this.options.spaceBeforeAssignmentOperators) {
                        if (!this.lastEntryIs(GrammarFormatter.Whitespace)) {
                            this.addSpace();
                        }
                        this.add(i);
                        this.addSpace();
                    }
                    else {
                        if (this.lastEntryIs(GrammarFormatter.Whitespace)) {
                            this.removeLastEntry();
                        }
                        this.add(i);
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.AT: {
                    if (inRule) {
                        this.removeTrailingWhitespaces();
                        if (this.options.ruleInternalsOnSingleLine) {
                            this.addSpace();
                        }
                        else {
                            this.addLineBreak();
                            ++this.currentIndentation;
                            this.pushCurrentIndentation();
                            --this.currentIndentation;
                        }
                    }
                    else {
                        inNamedAction = true;
                    }
                    this.add(i);
                    this.add(GrammarFormatter.WhitespaceEraser);
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.COLON: {
                    ++this.currentIndentation;
                    let { singleLineLength } = this.getBlockInfo(i, new Set([ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI]));
                    singleLineLength += this.currentColumn;
                    if (this.options.allowShortRulesOnASingleLine
                        && singleLineLength <= (2 * this.options.columnLimit / 3)) {
                        ++this.singleLineBlockNesting;
                        inSingleLineRule = true;
                    }
                    switch (this.options.alignColons) {
                        case "hanging": {
                            this.removeTrailingWhitespaces();
                            const forceNewLine = !this.options.singleLineOverrulesHangingColon;
                            this.addLineBreak(forceNewLine);
                            this.pushCurrentIndentation(forceNewLine);
                            this.add(i);
                            this.addSpace();
                            break;
                        }
                        case "none": {
                            this.removeTrailingWhitespaces();
                            this.add(i);
                            if (!this.nonBreakingTrailerAhead(i) && !inSingleLineRule) {
                                this.addLineBreak();
                                this.pushCurrentIndentation();
                            }
                            else {
                                this.addSpace();
                            }
                            break;
                        }
                        case "trailing": {
                            this.removeTrailingWhitespaces();
                            if (this.singleLineBlockNesting > 0) {
                                this.addAlignmentEntry(AlignmentType.Colon);
                                this.add(GrammarFormatter.WhitespaceEraser);
                            }
                            this.add(i);
                            if (!this.nonBreakingTrailerAhead(i) && !inSingleLineRule) {
                                this.addLineBreak();
                                this.pushCurrentIndentation();
                            }
                            else {
                                this.addSpace();
                            }
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                    if (this.options.alignFirstTokens && inSingleLineRule) {
                        this.addAlignmentEntry(AlignmentType.FirstToken);
                        this.add(GrammarFormatter.WhitespaceEraser);
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.COLONCOLON:
                    this.removeTrailingWhitespaces();
                    this.add(i);
                    this.add(GrammarFormatter.WhitespaceEraser);
                    break;
                case ANTLRv4Lexer_1.ANTLRv4Lexer.IMPORT:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LEXER:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.PARSER:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.GRAMMAR:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.MODE: {
                    if (!inNamedAction && !inRule) {
                        ++this.currentIndentation;
                        inSingleLineRule = true;
                        coalesceWhitespaces = true;
                        inRule = true;
                    }
                    this.add(i);
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.FRAGMENT:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.PRIVATE:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.PROTECTED:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.PUBLIC:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.TOKEN_REF:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.RULE_REF: {
                    if (!inNamedAction && !inBraces) {
                        inRule = true;
                    }
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.OPTIONS:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.TOKENS:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.CHANNELS: {
                    coalesceWhitespaces = true;
                    this.add(i);
                    if (!inLexerCommand) {
                        this.addSpace();
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.PLUS:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.QUESTION:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.STAR: {
                    this.removeTrailingWhitespaces();
                    this.add(i);
                    this.addSpace();
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.OR: {
                    if (this.singleLineBlockNesting > 1) {
                        this.addSpace();
                    }
                    else {
                        if (!inSingleLineRule) {
                            this.singleLineBlockNesting = 0;
                            this.removeTrailingTabsAndSpaces();
                            if (this.outputPipeline.length > 0 && !this.lastEntryIs(GrammarFormatter.LineBreak)) {
                                this.addLineBreak();
                            }
                            this.pushCurrentIndentation();
                            const { containsAlts, singleLineLength } = this.getBlockInfo(i, new Set([ANTLRv4Lexer_1.ANTLRv4Lexer.OR, ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI]));
                            if ((!containsAlts || this.options.allowShortBlocksOnASingleLine)
                                && singleLineLength <= (this.options.columnLimit / 2 + 3)) {
                                ++this.singleLineBlockNesting;
                            }
                        }
                    }
                    this.add(i);
                    this.addSpace();
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LPAREN: {
                    if (inLexerCommand) {
                        this.add(i);
                        break;
                    }
                    if (this.singleLineBlockNesting > 0) {
                        this.singleLineBlockNesting += 2;
                        ++this.currentIndentation;
                        this.add(i);
                    }
                    else {
                        if (this.options.allowShortBlocksOnASingleLine) {
                            let { singleLineLength } = this.getBlockInfo(i, new Set([ANTLRv4Lexer_1.ANTLRv4Lexer.RPAREN]));
                            singleLineLength += this.currentColumn;
                            if (singleLineLength <= (2 * this.options.columnLimit / 3)) {
                                this.singleLineBlockNesting += 2;
                            }
                        }
                        if (this.singleLineBlockNesting === 0) {
                            if (this.options.breakBeforeParens) {
                                this.removeTrailingWhitespaces();
                                this.addLineBreak();
                                this.pushCurrentIndentation();
                            }
                            this.add(i);
                            ++this.currentIndentation;
                            this.addLineBreak();
                            this.pushCurrentIndentation();
                            if (this.options.allowShortBlocksOnASingleLine) {
                                let { singleLineLength } = this.getBlockInfo(i, new Set([ANTLRv4Lexer_1.ANTLRv4Lexer.OR, ANTLRv4Lexer_1.ANTLRv4Lexer.RPAREN]));
                                singleLineLength += this.currentColumn;
                                if (singleLineLength <= (this.options.columnLimit / 2 + 3)) {
                                    ++this.singleLineBlockNesting;
                                }
                            }
                        }
                        else {
                            this.add(i);
                            this.add(GrammarFormatter.WhitespaceEraser);
                            ++this.currentIndentation;
                        }
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.RPAREN: {
                    if (inLexerCommand) {
                        this.add(i);
                        break;
                    }
                    if (this.singleLineBlockNesting > 0) {
                        --this.singleLineBlockNesting;
                    }
                    if (this.currentIndentation > 0) {
                        --this.currentIndentation;
                    }
                    this.removeTrailingWhitespaces();
                    if (this.singleLineBlockNesting > 0) {
                        this.add(i);
                    }
                    else {
                        this.addLineBreak();
                        this.pushCurrentIndentation();
                        this.add(i);
                    }
                    this.addSpace();
                    if (this.singleLineBlockNesting > 0) {
                        --this.singleLineBlockNesting;
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.GT: {
                    this.removeTrailingWhitespaces();
                    this.add(i);
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.RARROW: {
                    inLexerCommand = true;
                    if (this.options.alignTrailers) {
                        this.addAlignmentEntry(AlignmentType.Trailers);
                    }
                    else if (this.options.alignLexerCommands) {
                        this.addAlignmentEntry(AlignmentType.LexerCommand);
                    }
                    else {
                        if (!this.lastEntryIs(GrammarFormatter.Space)) {
                            this.addSpace();
                        }
                    }
                    this.add(i);
                    this.addSpace();
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.COMMA: {
                    this.removeTrailingWhitespaces();
                    this.add(i);
                    if (inBraces) {
                        coalesceWhitespaces = false;
                        if (!this.nonBreakingTrailerAhead(i)) {
                            this.addLineBreak();
                            this.pushCurrentIndentation();
                        }
                    }
                    else {
                        this.addSpace();
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.POUND: {
                    let willUseAlignment = false;
                    if (!inSingleLineRule) {
                        if (this.options.alignTrailers) {
                            willUseAlignment = true;
                            this.addAlignmentEntry(AlignmentType.Trailers);
                        }
                        else if (this.options.alignLabels) {
                            willUseAlignment = true;
                            this.addAlignmentEntry(AlignmentType.Label);
                        }
                    }
                    if (!willUseAlignment && !this.lastEntryIs(GrammarFormatter.Space)) {
                        this.addSpace();
                    }
                    this.add(i);
                    this.addSpace();
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.BEGIN_ARGUMENT: {
                    if (this.formattingDisabled) {
                        break;
                    }
                    this.removeTrailingWhitespaces();
                    this.add(i++);
                    const argumentStartIndex = i;
                    while (this.tokens[i].type !== antlr4ts_1.Token.EOF && this.tokens[i].type !== ANTLRv4Lexer_1.ANTLRv4Lexer.END_ARGUMENT) {
                        ++i;
                    }
                    this.addRaw(argumentStartIndex, i);
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.CATCH:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.FINALLY: {
                    inCatchFinally = true;
                    this.removeTrailingWhitespaces();
                    this.addLineBreak();
                    this.add(i);
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.RETURNS:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LOCALS: {
                    this.removeTrailingWhitespaces();
                    if (this.options.ruleInternalsOnSingleLine) {
                        this.addSpace();
                    }
                    else {
                        this.addLineBreak();
                        ++this.currentIndentation;
                        this.pushCurrentIndentation();
                        --this.currentIndentation;
                    }
                    this.add(i);
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.STRING_LITERAL:
                    this.add(i);
                    this.addSpace();
                    break;
                case antlr4ts_1.Token.EOF:
                    this.removeTrailingWhitespaces();
                    this.addLineBreak();
                    break;
                default:
                    coalesceWhitespaces = true;
                    this.add(i);
                    break;
            }
        }
        if (this.lastEntryIs(GrammarFormatter.WhitespaceEraser)) {
            this.removeLastEntry();
        }
        if (this.tokens[endIndex].type !== ANTLRv4Lexer_1.ANTLRv4Lexer.WS) {
            if (this.lastEntryIs(GrammarFormatter.Alignment)) {
                this.removeLastEntry();
            }
            this.removeTrailingWhitespaces();
        }
        if (this.formattingDisabled && this.rangeStart > -1) {
            this.addRaw(this.rangeStart, endIndex);
        }
        this.computeAlignments();
        let result = "";
        let pendingLineComment = -1;
        let hadErrorOnLine = false;
        for (const entry of this.outputPipeline) {
            switch (entry) {
                case GrammarFormatter.LineBreak:
                    if (pendingLineComment > 0) {
                        if (result.length > 0) {
                            const lastChar = result[result.length - 1];
                            if (lastChar !== " " && lastChar !== "\t" && lastChar !== "\n") {
                                result += " ";
                            }
                        }
                        result += this.tokens[pendingLineComment].text;
                        pendingLineComment = -1;
                    }
                    result += "\n";
                    hadErrorOnLine = false;
                    break;
                case GrammarFormatter.Space:
                    result += " ";
                    break;
                case GrammarFormatter.Tab:
                    result += "\t";
                    break;
                case GrammarFormatter.WhitespaceEraser:
                    break;
                case GrammarFormatter.Error:
                    if (!hadErrorOnLine) {
                        result += "<<Unexpected input or wrong formatter command>>";
                        hadErrorOnLine = true;
                    }
                    break;
                default:
                    if (entry < 0) {
                        if (this.isWhitespaceBlock(entry)) {
                            result += this.whitespaceList[-(entry - GrammarFormatter.WhitespaceBlock)];
                        }
                        else if (this.isRangeBlock(entry)) {
                            const rangeIndex = -(entry - GrammarFormatter.Range);
                            const tokenStart = this.ranges[rangeIndex][0];
                            const tokenEnd = this.ranges[rangeIndex][1];
                            const interval = misc_1.Interval.of(this.tokens[tokenStart].startIndex, this.tokens[tokenEnd].stopIndex);
                            result += this.tokens[0].inputStream.getText(interval);
                        }
                    }
                    else {
                        if (this.tokens[entry].type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
                            pendingLineComment = entry;
                            break;
                        }
                        result += this.tokens[entry].text;
                    }
                    break;
            }
        }
        if (pendingLineComment > 0) {
            if (result.length > 0) {
                const lastChar = result[result.length - 1];
                if (lastChar !== " " && lastChar !== "\t" && lastChar !== "\n") {
                    result += " ";
                }
            }
            result += this.tokens[pendingLineComment].text;
        }
        return [result, targetStart, targetStop];
    }
    setDefaultOptions() {
        this.options = {};
        this.options.alignTrailingComments = false;
        this.options.allowShortBlocksOnASingleLine = true;
        this.options.breakBeforeBraces = false;
        this.options.columnLimit = 100;
        this.options.indentWidth = 4;
        this.options.continuationIndentWidth = this.options.indentWidth;
        this.options.keepEmptyLinesAtTheStartOfBlocks = false;
        this.options.maxEmptyLinesToKeep = 1;
        this.options.reflowComments = true;
        this.options.spaceBeforeAssignmentOperators = true;
        this.options.tabWidth = 4;
        this.options.useTab = true;
        this.options.alignColons = "none";
        this.options.allowShortRulesOnASingleLine = true;
        this.options.alignSemicolons = "ownLine";
        this.options.singleLineOverrulesHangingColon = true;
        this.options.breakBeforeParens = false;
        this.options.ruleInternalsOnSingleLine = false;
        this.options.minEmptyLines = 0;
        this.options.groupedAlignments = true;
        this.options.alignFirstTokens = false;
        this.options.alignLexerCommands = false;
        this.options.alignActions = false;
        this.options.alignLabels = true;
        this.options.alignTrailers = false;
    }
    entryIs(index, marker) {
        if (index < 0 || index >= this.outputPipeline.length) {
            return false;
        }
        const entry = this.outputPipeline[index];
        switch (marker) {
            case GrammarFormatter.Whitespace: {
                return entry === GrammarFormatter.LineBreak || entry === GrammarFormatter.Space
                    || entry === GrammarFormatter.Tab;
            }
            case GrammarFormatter.Space: {
                return entry === GrammarFormatter.Space;
            }
            case GrammarFormatter.Tab: {
                return entry === GrammarFormatter.Tab;
            }
            case GrammarFormatter.LineBreak: {
                return entry === GrammarFormatter.LineBreak;
            }
            case GrammarFormatter.Comment: {
                if (entry < 0) {
                    return false;
                }
                const token = this.tokens[entry];
                return token.type === ANTLRv4Lexer_1.ANTLRv4Lexer.BLOCK_COMMENT || token.type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT
                    || token.type === ANTLRv4Lexer_1.ANTLRv4Lexer.DOC_COMMENT;
            }
            default: {
                if (entry < 0) {
                    return entry === marker;
                }
                const token = this.tokens[entry];
                return token.type === marker;
            }
        }
    }
    lastEntryIs(marker) {
        return this.entryIs(this.outputPipeline.length - 1, marker);
    }
    lineHasNonWhitespaceContent() {
        let index = this.outputPipeline.length;
        while (--index > 0) {
            if (this.outputPipeline[index] !== GrammarFormatter.Space
                && this.outputPipeline[index] !== GrammarFormatter.Tab) {
                break;
            }
        }
        if (index <= 0) {
            return false;
        }
        return this.outputPipeline[index] !== GrammarFormatter.LineBreak;
    }
    lastCodeTokenIs(marker) {
        let i = this.outputPipeline.length - 1;
        while (i >= 0) {
            if (!this.entryIs(i, GrammarFormatter.WhitespaceEraser)
                && !this.entryIs(i, GrammarFormatter.Whitespace)
                && !this.entryIs(i, GrammarFormatter.LineBreak)
                && !this.entryIs(i, GrammarFormatter.Comment)) {
                break;
            }
            --i;
        }
        if (i < 0 || this.outputPipeline[i] < 0) {
            return false;
        }
        return this.tokens[this.outputPipeline[i]].type === marker;
    }
    removeLastEntry() {
        if (this.formattingDisabled) {
            return;
        }
        const lastEntry = this.outputPipeline[this.outputPipeline.length - 1];
        this.outputPipeline.pop();
        switch (lastEntry) {
            case GrammarFormatter.WhitespaceEraser:
                break;
            case GrammarFormatter.LineBreak:
                --this.currentLine;
                break;
            case GrammarFormatter.Tab: {
                const offset = this.currentColumn % this.options.tabWidth;
                this.currentColumn -= (offset > 0 ? offset : this.options.tabWidth);
                break;
            }
            default:
                --this.currentColumn;
                break;
        }
        console.assert(this.currentLine >= 0, "Current line can never be less than 0");
        console.assert(this.currentColumn >= 0, "Current column can never be less than 0");
    }
    removeTrailingTabsAndSpaces() {
        if (this.formattingDisabled) {
            return;
        }
        while (this.lastEntryIs(GrammarFormatter.Space) || this.lastEntryIs(GrammarFormatter.Tab)) {
            this.removeLastEntry();
        }
    }
    removeTrailingWhitespaces() {
        if (this.formattingDisabled) {
            return;
        }
        while (this.lastEntryIs(GrammarFormatter.Whitespace)) {
            this.removeLastEntry();
        }
    }
    pushCurrentIndentation(force = false) {
        if (this.formattingDisabled || (!force && this.singleLineBlockNesting > 0)) {
            return;
        }
        if (this.options.useTab) {
            const tabs = Array(this.currentIndentation).fill(GrammarFormatter.Tab);
            this.outputPipeline.push(...tabs);
            this.currentColumn = this.currentIndentation * this.options.tabWidth;
        }
        else {
            const spaces = Array(this.currentIndentation * (this.options.indentWidth ?? 4))
                .fill(GrammarFormatter.Space);
            this.outputPipeline.push(...spaces);
            this.currentColumn = this.currentIndentation * this.options.indentWidth;
        }
    }
    applyLineContinuation() {
        while (this.lastEntryIs(GrammarFormatter.Space) || this.lastEntryIs(GrammarFormatter.Tab)) {
            this.removeLastEntry();
        }
        if (!this.lastEntryIs(GrammarFormatter.LineBreak)) {
            this.outputPipeline.push(GrammarFormatter.LineBreak);
            ++this.currentLine;
        }
        this.currentColumn = 0;
        this.pushCurrentIndentation(true);
        if (this.options.useTab) {
            this.outputPipeline.push(GrammarFormatter.Tab);
        }
        else {
            const spaces = Array(this.options.continuationIndentWidth).fill(GrammarFormatter.Space);
            this.outputPipeline.push(...spaces);
        }
        this.currentColumn += this.options.continuationIndentWidth;
    }
    add(marker) {
        if (this.formattingDisabled) {
            return;
        }
        const insertBlock = (token) => {
            const parts = token.text.split("\n");
            if (parts.length === 1) {
                this.currentColumn += token.text.length;
            }
            else {
                this.currentLine += parts.length - 1;
                this.currentColumn = this.computeLineLength(parts[parts.length - 1]);
            }
            this.outputPipeline.push(marker);
        };
        switch (marker) {
            case GrammarFormatter.WhitespaceEraser: {
                this.outputPipeline.push(marker);
                return;
            }
            case GrammarFormatter.LineBreak: {
                this.outputPipeline.push(marker);
                ++this.currentLine;
                this.currentColumn = 0;
                return;
            }
            default: {
                let token;
                if (marker >= 0) {
                    token = this.tokens[marker];
                }
                if (token) {
                    switch (token.type) {
                        case ANTLRv4Lexer_1.ANTLRv4Lexer.BLOCK_COMMENT: {
                            insertBlock(token);
                            return;
                        }
                        case ANTLRv4Lexer_1.ANTLRv4Lexer.ACTION_CONTENT: {
                            insertBlock(this.tokens[marker]);
                            return;
                        }
                        default: {
                            const tokenLength = token.stopIndex - token.startIndex + 1;
                            if (this.currentColumn + tokenLength > this.options.columnLimit) {
                                if (this.lineHasNonWhitespaceContent()) {
                                    this.applyLineContinuation();
                                }
                            }
                            this.currentColumn += tokenLength;
                            this.outputPipeline.push(marker);
                            break;
                        }
                    }
                }
                else {
                    ++this.currentColumn;
                    this.outputPipeline.push(marker);
                }
                break;
            }
        }
    }
    tokenFromIndex(charIndex, first) {
        if (charIndex < 0) {
            return 0;
        }
        if (charIndex >= this.tokens[0].inputStream.size) {
            return this.tokens.length - 1;
        }
        for (let i = 0; i < this.tokens.length; ++i) {
            const token = this.tokens[i];
            if (token.startIndex > charIndex) {
                if (i === 0) {
                    return i;
                }
                --i;
                if (!first) {
                    return i;
                }
                const row = this.tokens[i].line;
                while (i > 0 && this.tokens[i - 1].line === row) {
                    --i;
                }
                return i;
            }
        }
        return this.tokens.length - 1;
    }
    computeLineLength(text) {
        let length = 0;
        for (const char of text) {
            if (char === "\t") {
                const offsetToNextTabStop = this.options.tabWidth - (this.currentColumn % this.options.tabWidth);
                length += offsetToNextTabStop;
            }
            else {
                ++length;
            }
        }
        return length;
    }
    addRaw(start, stop) {
        const interval = misc_1.Interval.of(this.tokens[start].startIndex, this.tokens[stop].stopIndex);
        const text = this.tokens[0].inputStream.getText(interval);
        if (text.indexOf("\n") >= 0) {
            const parts = text.split("\n");
            this.currentLine += parts.length - 1;
            this.currentColumn = this.computeLineLength(parts[parts.length - 1]);
        }
        else {
            this.currentColumn += this.computeLineLength(text);
        }
        this.ranges.push([start, stop]);
        this.outputPipeline.push(GrammarFormatter.Range - this.currentRangeIndex++);
    }
    addSpace() {
        if (this.outputPipeline.length > 0
            && !this.lastEntryIs(GrammarFormatter.Space)
            && !this.lastEntryIs(ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT)) {
            this.add(GrammarFormatter.Space);
        }
    }
    addLineBreak(force = false) {
        if (this.singleLineBlockNesting === 0 || force) {
            while (this.lastEntryIs(GrammarFormatter.Space) || this.lastEntryIs(GrammarFormatter.Tab)) {
                this.removeLastEntry();
            }
            this.add(GrammarFormatter.LineBreak);
        }
    }
    ensureMinEmptyLines() {
        if (this.formattingDisabled) {
            return;
        }
        if (this.options.minEmptyLines > 0) {
            let lineBreakCount = Math.min(this.options.minEmptyLines, this.options.maxEmptyLinesToKeep) + 1;
            for (let i = this.outputPipeline.length - 1; i > 0 && lineBreakCount > 0; --i) {
                if (this.entryIs(i, GrammarFormatter.LineBreak)) {
                    --lineBreakCount;
                }
                else if (!this.entryIs(i, GrammarFormatter.Whitespace)) {
                    break;
                }
            }
            const lineBreaks = Array(lineBreakCount).fill(GrammarFormatter.LineBreak);
            this.outputPipeline.push(...lineBreaks);
            this.currentLine += lineBreakCount;
            if (lineBreakCount > 0) {
                this.currentColumn = 0;
            }
        }
        else if (!this.lastEntryIs(GrammarFormatter.LineBreak)) {
            this.addLineBreak();
        }
    }
    getBlockInfo(i, stoppers) {
        let containsAlts = false;
        let singleLineLength = 1;
        let nestingLevel = 0;
        let token = this.tokens[i];
        if (token.type === ANTLRv4Lexer_1.ANTLRv4Lexer.COLON || token.type === ANTLRv4Lexer_1.ANTLRv4Lexer.OR) {
            ++singleLineLength;
        }
        const checkTrailingComment = () => {
            while (this.tokens[++i].type === ANTLRv4Lexer_1.ANTLRv4Lexer.WS) {
                if (this.tokens[i].text.indexOf("\n") >= 0) {
                    break;
                }
            }
            if (this.tokens[i].type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
                singleLineLength += this.tokens[i].text.length;
            }
        };
        while (++i < this.tokens.length) {
            token = this.tokens[i];
            switch (token.type) {
                case ANTLRv4Lexer_1.ANTLRv4Lexer.WS: {
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LPAREN: {
                    ++nestingLevel;
                    ++singleLineLength;
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.RPAREN: {
                    ++singleLineLength;
                    if (nestingLevel > 0) {
                        --nestingLevel;
                    }
                    else {
                        checkTrailingComment();
                        return { containsAlts, singleLineLength };
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI: {
                    ++singleLineLength;
                    if (stoppers.has(ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI)) {
                        checkTrailingComment();
                        return { containsAlts, singleLineLength };
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.QUESTION:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.STAR:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.PLUS: {
                    ++singleLineLength;
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT: {
                    return { containsAlts, singleLineLength: 1e100 };
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.BLOCK_COMMENT:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.DOC_COMMENT: {
                    if (token.text.indexOf("\n") >= 0) {
                        return { containsAlts, singleLineLength: 1e100 };
                    }
                    else {
                        singleLineLength += token.text.length + 1;
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.BEGIN_ACTION:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.ACTION_CONTENT:
                case ANTLRv4Lexer_1.ANTLRv4Lexer.END_ACTION: {
                    if (token.text === "\n") {
                        return { containsAlts, singleLineLength: 1e100 };
                    }
                    else {
                        ++singleLineLength;
                    }
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.OR: {
                    if (nestingLevel === 0) {
                        if (stoppers.has(ANTLRv4Lexer_1.ANTLRv4Lexer.OR)) {
                            checkTrailingComment();
                            return { containsAlts, singleLineLength };
                        }
                        containsAlts = true;
                    }
                    singleLineLength += 2;
                    break;
                }
                case ANTLRv4Lexer_1.ANTLRv4Lexer.NOT: {
                    ++singleLineLength;
                    break;
                }
                default:
                    if (token.text) {
                        singleLineLength += token.text.length;
                    }
                    ++singleLineLength;
                    break;
            }
        }
        return { containsAlts, singleLineLength };
    }
    nonBreakingTrailerAhead(i) {
        if (this.tokens[++i].type === ANTLRv4Lexer_1.ANTLRv4Lexer.WS) {
            if (this.tokens[i].text.indexOf("\n") >= 0) {
                return false;
            }
            ++i;
        }
        return this.tokens[i].type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT
            || this.tokens[i].type === ANTLRv4Lexer_1.ANTLRv4Lexer.RARROW
            || this.tokens[i].type === ANTLRv4Lexer_1.ANTLRv4Lexer.LPAREN;
    }
    processFormattingCommands(index) {
        const resetAlignmentStatus = (alignments) => {
            for (const type of alignments) {
                const status = this.alignments.get(type);
                if (status) {
                    status.lastLine = -1;
                }
            }
        };
        let text = this.tokens[index].text;
        text = text.substr(2, text.length - 2).trim();
        if (text.startsWith(formatIntroducer)) {
            const entries = text.substr(formatIntroducer.length + 1, text.length).split(",");
            for (const entry of entries) {
                const groups = /(\w+)(?:(?:\s*:)?\s*)?(\w+|[0-9]+)?/i.exec(entry.trim());
                if (groups) {
                    switch (groups[1]) {
                        case "reset": {
                            this.setDefaultOptions();
                            break;
                        }
                        case "on":
                        case "true": {
                            this.formattingDisabled = false;
                            if (this.rangeStart > -1) {
                                this.addRaw(this.rangeStart, index - 1);
                            }
                            break;
                        }
                        case "off":
                        case "false": {
                            this.formattingDisabled = true;
                            this.rangeStart = index;
                            break;
                        }
                        case "alignTrailingComments":
                        case "allowShortBlocksOnASingleLine":
                        case "breakBeforeBraces":
                        case "keepEmptyLinesAtTheStartOfBlocks":
                        case "reflowComments":
                        case "spaceBeforeAssignmentOperators":
                        case "useTab":
                        case "allowShortRulesOnASingleLine":
                        case "singleLineOverrulesHangingColon":
                        case "breakBeforeParens":
                        case "ruleInternalsOnSingleLine":
                        case "groupedAlignments":
                        case "alignFirstTokens":
                        case "alignLexerCommands":
                        case "alignActions":
                        case "alignLabels":
                        case "alignTrailers": {
                            if ((groups.length > 2 && (groups[2] === "true" || groups[2] === "false"))
                                || groups[2] === "on"
                                || groups[2] === "off") {
                                this.options[groups[1]] = (groups[2] === "true" || groups[2] === "on");
                                switch (groups[1]) {
                                    case "groupedAlignments": {
                                        resetAlignmentStatus(allAlignments);
                                        break;
                                    }
                                    case "alignTrailingComments": {
                                        resetAlignmentStatus([AlignmentType.TrailingComment]);
                                        break;
                                    }
                                    case "alignFirstTokens": {
                                        resetAlignmentStatus([AlignmentType.FirstToken]);
                                        break;
                                    }
                                    case "alignLexerCommands": {
                                        resetAlignmentStatus([AlignmentType.LexerCommand]);
                                        break;
                                    }
                                    case "alignActions": {
                                        resetAlignmentStatus([AlignmentType.Action]);
                                        break;
                                    }
                                    case "alignLabels": {
                                        resetAlignmentStatus([AlignmentType.Label]);
                                        break;
                                    }
                                    case "alignTrailers": {
                                        resetAlignmentStatus([AlignmentType.Trailers]);
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            }
                            else {
                                this.add(GrammarFormatter.Error);
                            }
                            break;
                        }
                        case "columnLimit":
                        case "continuationIndentWidth":
                        case "indentWidth":
                        case "maxEmptyLinesToKeep":
                        case "tabWidth":
                        case "minEmptyLines": {
                            if (groups.length > 2) {
                                const value = parseInt(groups[2], 10);
                                if (value !== undefined) {
                                    this.options[groups[1]] = value;
                                }
                                else {
                                    this.add(GrammarFormatter.Error);
                                }
                            }
                            else {
                                this.add(GrammarFormatter.Error);
                            }
                            break;
                        }
                        case "alignColons": {
                            if (groups.length > 2) {
                                const value = groups[2];
                                if (value === "none" || value === "trailing" || value === "hanging") {
                                    this.options.alignColons = value;
                                }
                                else {
                                    this.add(GrammarFormatter.Error);
                                }
                            }
                            else {
                                this.add(GrammarFormatter.Error);
                            }
                            break;
                        }
                        case "alignSemicolons": {
                            if (groups.length > 2) {
                                const value = groups[2];
                                if (value === "none" || value === "ownLine" || value === "hanging") {
                                    this.options.alignSemicolons = value;
                                }
                                else {
                                    this.add(GrammarFormatter.Error);
                                }
                            }
                            else {
                                this.add(GrammarFormatter.Error);
                            }
                            break;
                        }
                        default: {
                            this.add(GrammarFormatter.Error);
                            break;
                        }
                    }
                }
            }
        }
    }
    addAlignmentEntry(type) {
        if (!this.alignments.has(type)) {
            this.alignments.set(type, { lastLine: -1, groups: [] });
        }
        const status = this.alignments.get(type);
        if (status.lastLine !== this.currentLine) {
            if (this.lineHasNonWhitespaceContent()) {
                this.removeTrailingTabsAndSpaces();
            }
            let startNewGroup = true;
            if (status.lastLine > -1) {
                if (!this.options.groupedAlignments || status.lastLine + 1 === this.currentLine) {
                    startNewGroup = false;
                    status.groups[status.groups.length - 1].push(this.outputPipeline.length);
                }
            }
            if (startNewGroup) {
                status.groups.push([this.outputPipeline.length]);
            }
            this.outputPipeline.push(GrammarFormatter.Alignment);
            status.lastLine = this.currentLine;
        }
    }
    computeAlignments() {
        for (const type of allAlignments) {
            const alignment = this.alignments.get(type);
            if (alignment) {
                for (const group of alignment.groups) {
                    if (group.length === 1) {
                        if (group[0] < this.outputPipeline.length) {
                            if (this.entryIs(group[0] - 1, GrammarFormatter.Whitespace)
                                || this.entryIs(group[0] - 1, ANTLRv4Lexer_1.ANTLRv4Lexer.LPAREN)) {
                                this.outputPipeline[group[0]] = GrammarFormatter.WhitespaceEraser;
                            }
                            else {
                                this.outputPipeline[group[0]] = GrammarFormatter.Space;
                            }
                        }
                        continue;
                    }
                    const columns = [];
                    for (const member of group) {
                        if (member < this.outputPipeline.length) {
                            console.assert(this.outputPipeline[member] <= GrammarFormatter.Alignment);
                            columns.push(this.columnForEntry(member));
                        }
                    }
                    const useTabs = this.options.useTab;
                    let maxColumn = Math.max(...columns);
                    if (useTabs) {
                        maxColumn += this.options.tabWidth - (maxColumn % this.options.tabWidth);
                    }
                    else {
                        ++maxColumn;
                    }
                    for (let i = 0; i < group.length; ++i) {
                        const whitespaceIndex = GrammarFormatter.WhitespaceBlock - this.whitespaceList.length;
                        this.outputPipeline[group[i]] = whitespaceIndex;
                        let whitespaces;
                        if (useTabs) {
                            let tabCount = Math.floor((maxColumn - columns[i]) / this.options.tabWidth);
                            if ((maxColumn - columns[i]) % this.options.tabWidth !== 0) {
                                ++tabCount;
                            }
                            whitespaces = Array(tabCount).fill("\t").join("");
                        }
                        else {
                            whitespaces = Array(maxColumn - columns[i]).fill(" ").join("");
                        }
                        this.whitespaceList.push(whitespaces);
                    }
                }
            }
        }
    }
    columnForEntry(offset) {
        let result = 0;
        let run = offset;
        while (--run > -1) {
            if (this.outputPipeline[run] === GrammarFormatter.LineBreak) {
                break;
            }
        }
        let text = "";
        while (++run < offset) {
            const entry = this.outputPipeline[run];
            switch (entry) {
                case GrammarFormatter.Space:
                    text += " ";
                    break;
                case GrammarFormatter.Tab:
                    text += "\t";
                    break;
                case GrammarFormatter.WhitespaceEraser:
                case GrammarFormatter.Error:
                    break;
                default:
                    if (entry < 0) {
                        if (this.isRangeBlock(entry)) {
                            const rangeIndex = -(entry - GrammarFormatter.Range);
                            const startIndex = this.ranges[rangeIndex][0];
                            const endIndex = this.ranges[rangeIndex][1];
                            const interval = misc_1.Interval.of(this.tokens[startIndex].startIndex, this.tokens[endIndex].stopIndex);
                            text += this.tokens[0].inputStream.getText(interval);
                        }
                        else if (this.isWhitespaceBlock(entry)) {
                            const whitespaceIndex = -(entry - GrammarFormatter.WhitespaceBlock);
                            text += this.whitespaceList[whitespaceIndex];
                        }
                    }
                    else {
                        text += this.tokens[entry].text;
                    }
                    break;
            }
        }
        for (const char of text) {
            if (char === "\t") {
                result += this.options.tabWidth - (result % this.options.tabWidth);
            }
            else {
                ++result;
            }
        }
        return result;
    }
    reflowComment(comment, type) {
        const result = [];
        let lineIntroducer = (type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) ? "// " : " * ";
        const lines = comment.split("\n");
        let lineIndex = 0;
        let pipeline = lines[lineIndex++].split(/ |\t/).filter((entry) => {
            return entry.length > 0;
        });
        let line;
        if (type !== ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
            if (!lines[1].trim().startsWith("*")) {
                lineIntroducer = " ";
            }
            const last = lines[lines.length - 1].trim().slice(0, -2);
            if (last.length === 0) {
                lines.pop();
            }
            else {
                lines[lines.length - 1] = last;
            }
        }
        let isFirst = false;
        if (pipeline.length === 1) {
            result.push(pipeline[0]);
            line = lineIntroducer;
            isFirst = true;
        }
        else {
            line = pipeline[0] + " ";
        }
        let index = 1;
        let column = this.computeLineLength(line);
        while (true) {
            while (index < pipeline.length) {
                if (this.currentColumn + column + pipeline[index].length > this.options.columnLimit) {
                    result.push(line.slice(0, -1));
                    line = lineIntroducer;
                    column = this.computeLineLength(line);
                }
                line += pipeline[index++] + " ";
                column = this.computeLineLength(line);
            }
            if (lineIndex === lines.length) {
                break;
            }
            pipeline = lines[lineIndex++].split(/ |\t/).filter((entry) => {
                return entry.length > 0;
            });
            index = 0;
            if (pipeline.length > 0) {
                const first = pipeline[0];
                if (type === ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
                    if (first === "//") {
                        pipeline = pipeline.slice(1);
                    }
                    else {
                        pipeline[0] = first.substr(2);
                    }
                }
                else {
                    if (first === "*") {
                        pipeline = pipeline.slice(1);
                    }
                    else {
                        if (first.startsWith("*")) {
                            pipeline[0] = first.substr(1);
                        }
                    }
                }
            }
            if (pipeline.length === 0) {
                if (!isFirst) {
                    result.push(line.slice(0, -1));
                }
                result.push(lineIntroducer);
                line = lineIntroducer;
            }
            isFirst = false;
        }
        if (line.length > 0) {
            result.push(line.slice(0, -1));
        }
        if (type !== ANTLRv4Lexer_1.ANTLRv4Lexer.LINE_COMMENT) {
            result.push(" */");
        }
        const indentation = (this.options.useTab)
            ? "\t".repeat(this.currentIndentation)
            : " ".repeat(this.currentIndentation * this.options.indentWidth);
        return result.join("\n" + indentation);
    }
    isRangeBlock = (marker) => {
        return (marker <= GrammarFormatter.Range) && (marker > GrammarFormatter.Alignment);
    };
    isWhitespaceBlock = (marker) => {
        return (marker <= GrammarFormatter.WhitespaceBlock);
    };
}
exports.GrammarFormatter = GrammarFormatter;
//# sourceMappingURL=Formatter.js.map
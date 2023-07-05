export declare enum GrammarType {
    Unknown = 0,
    Parser = 1,
    Lexer = 2,
    Combined = 3
}
export declare enum SymbolGroupKind {
    TokenRef = 0,
    RuleRef = 1,
    LexerMode = 2,
    TokenChannel = 3
}
export declare enum SymbolKind {
    Unknown = 0,
    Terminal = 1,
    Keyword = 2,
    TokenVocab = 3,
    Import = 4,
    BuiltInLexerToken = 5,
    VirtualLexerToken = 6,
    FragmentLexerToken = 7,
    LexerRule = 8,
    BuiltInMode = 9,
    LexerMode = 10,
    BuiltInChannel = 11,
    TokenChannel = 12,
    ParserRule = 13,
    Operator = 14,
    Option = 15,
    TokenReference = 16,
    RuleReference = 17,
    LexerCommand = 18,
    GlobalNamedAction = 19,
    LocalNamedAction = 20,
    ExceptionAction = 21,
    FinallyAction = 22,
    ParserAction = 23,
    LexerAction = 24,
    ParserPredicate = 25,
    LexerPredicate = 26,
    Arguments = 27
}
export interface ILexicalRange {
    start: {
        column: number;
        row: number;
    };
    end: {
        column: number;
        row: number;
    };
}
export interface IDefinition {
    text: string;
    range: ILexicalRange;
}
export interface ISymbolInfo {
    kind: SymbolKind;
    name: string;
    source: string;
    definition?: IDefinition;
    description?: string;
}
export declare enum DiagnosticType {
    Hint = 0,
    Info = 1,
    Warning = 2,
    Error = 3
}
export interface IDiagnosticEntry {
    type: DiagnosticType;
    message: string;
    range: ILexicalRange;
}
export interface ILexerToken {
    [key: string]: string | number | object;
    text: string;
    type: number;
    name: string;
    line: number;
    offset: number;
    channel: number;
    tokenIndex: number;
    startIndex: number;
    stopIndex: number;
}
export interface IIndexRange {
    startIndex: number;
    stopIndex: number;
    length: number;
}
export interface IParseTreeNode {
    type: "rule" | "terminal" | "error";
    id: number;
    ruleIndex?: number;
    name: string;
    start?: ILexerToken;
    stop?: ILexerToken;
    range?: IIndexRange;
    symbol?: ILexerToken;
    children: IParseTreeNode[];
}
export interface IReferenceNode {
    kind: SymbolKind;
    rules: Set<string>;
    tokens: Set<string>;
    literals: Set<string>;
}
export declare enum CodeActionType {
    GlobalNamed = 0,
    LocalNamed = 1,
    ParserAction = 2,
    LexerAction = 3,
    ParserPredicate = 4,
    LexerPredicate = 5
}
export interface IGenerationOptions {
    baseDir?: string;
    libDir?: string;
    outputDir?: string;
    package?: string;
    language?: string;
    listeners?: boolean;
    visitors?: boolean;
    loadOnly?: boolean;
    generateIfNeeded?: boolean;
    alternativeJar?: string;
    additionalParameters?: string;
}
export interface ISentenceGenerationOptions {
    count?: number;
    clear?: boolean;
    convergenceFactor?: number;
    minParserIterations?: number;
    maxParserIterations?: number;
    minLexerIterations?: number;
    maxLexerIterations?: number;
    maxRecursions?: number;
    maxRecursionLabel?: string;
    ruleMappings?: IRuleMappings;
    actionFile?: string;
}
export interface IRuleMappings {
    [key: string]: string | string[];
}
export interface IFormattingOptions {
    [key: string]: boolean | number | string | undefined;
    alignTrailingComments?: boolean;
    allowShortBlocksOnASingleLine?: boolean;
    breakBeforeBraces?: boolean;
    columnLimit?: number;
    continuationIndentWidth?: number;
    indentWidth?: number;
    keepEmptyLinesAtTheStartOfBlocks?: boolean;
    maxEmptyLinesToKeep?: number;
    reflowComments?: boolean;
    spaceBeforeAssignmentOperators?: boolean;
    tabWidth?: number;
    useTab?: boolean;
    alignColons?: "none" | "trailing" | "hanging";
    singleLineOverrulesHangingColon?: boolean;
    allowShortRulesOnASingleLine?: boolean;
    alignSemicolons?: "none" | "ownLine" | "hanging";
    breakBeforeParens?: boolean;
    ruleInternalsOnSingleLine?: boolean;
    minEmptyLines?: number;
    groupedAlignments?: boolean;
    alignFirstTokens?: boolean;
    alignLexerCommands?: boolean;
    alignActions?: boolean;
    alignLabels?: boolean;
    alignTrailers?: boolean;
}
export type PredicateFunction = (predicate: string) => boolean;
export interface IContextDetails {
    type: GrammarType;
    unreferencedRules: string[];
    imports: string[];
}
export interface ISelfDiagnostics {
    contextCount: number;
}

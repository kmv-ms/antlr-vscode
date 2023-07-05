import { ParserRuleContext } from "antlr4ts";
import { SymbolTable, SymbolTableOptions, BaseSymbol, ScopedSymbol } from "antlr4-c3";
import { ISymbolInfo, CodeActionType, SymbolKind, SymbolGroupKind } from "./types";
import { SourceContext } from "./SourceContext";
import { ParseTree } from "antlr4ts/tree";
export declare class OptionSymbol extends BaseSymbol {
    value: string;
}
export declare class ImportSymbol extends BaseSymbol {
}
export declare class BuiltInTokenSymbol extends BaseSymbol {
}
export declare class VirtualTokenSymbol extends BaseSymbol {
}
export declare class FragmentTokenSymbol extends ScopedSymbol {
}
export declare class TokenSymbol extends ScopedSymbol {
}
export declare class TokenReferenceSymbol extends BaseSymbol {
}
export declare class BuiltInModeSymbol extends BaseSymbol {
}
export declare class LexerModeSymbol extends BaseSymbol {
}
export declare class BuiltInChannelSymbol extends BaseSymbol {
}
export declare class TokenChannelSymbol extends BaseSymbol {
}
export declare class RuleSymbol extends ScopedSymbol {
}
export declare class RuleReferenceSymbol extends BaseSymbol {
}
export declare class AlternativeSymbol extends ScopedSymbol {
}
export declare class EbnfSuffixSymbol extends BaseSymbol {
}
export declare class OptionsSymbol extends ScopedSymbol {
}
export declare class ArgumentSymbol extends ScopedSymbol {
}
export declare class OperatorSymbol extends BaseSymbol {
}
export declare class TerminalSymbol extends BaseSymbol {
}
export declare class LexerCommandSymbol extends BaseSymbol {
}
export declare class GlobalNamedActionSymbol extends BaseSymbol {
}
export declare class LocalNamedActionSymbol extends BaseSymbol {
}
export declare class ExceptionActionSymbol extends BaseSymbol {
}
export declare class FinallyActionSymbol extends BaseSymbol {
}
export declare class ParserActionSymbol extends BaseSymbol {
}
export declare class LexerActionSymbol extends BaseSymbol {
}
export declare class ParserPredicateSymbol extends BaseSymbol {
}
export declare class LexerPredicateSymbol extends BaseSymbol {
}
export declare class ArgumentsSymbol extends BaseSymbol {
}
export declare class ContextSymbolTable extends SymbolTable {
    owner?: SourceContext | undefined;
    tree: ParserRuleContext;
    private symbolReferences;
    private namedActions;
    private parserActions;
    private lexerActions;
    private parserPredicates;
    private lexerPredicates;
    constructor(name: string, options: SymbolTableOptions, owner?: SourceContext | undefined);
    clear(): void;
    symbolExists(name: string, kind: SymbolKind, localOnly: boolean): boolean;
    symbolExistsInGroup(symbol: string, kind: SymbolGroupKind, localOnly: boolean): boolean;
    contextForSymbol(symbolName: string, kind: SymbolKind, localOnly: boolean): ParseTree | undefined;
    getSymbolInfo(symbol: string | BaseSymbol): ISymbolInfo | undefined;
    listTopLevelSymbols(localOnly: boolean): ISymbolInfo[];
    listActions(type: CodeActionType): ISymbolInfo[];
    getActionCounts(): Map<CodeActionType, number>;
    getReferenceCount(symbolName: string): number;
    getUnreferencedSymbols(): string[];
    incrementSymbolRefCount(symbolName: string): void;
    getSymbolOccurrences(symbolName: string, localOnly: boolean): ISymbolInfo[];
    defineNamedAction(action: BaseSymbol): void;
    defineParserAction(action: BaseSymbol): void;
    defineLexerAction(action: BaseSymbol): void;
    definePredicate(predicate: BaseSymbol): void;
    symbolContainingContext(context: ParseTree): BaseSymbol | undefined;
    private actionListOfType;
    private symbolsOfType;
    private getSymbolOfType;
}

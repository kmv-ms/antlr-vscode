"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextSymbolTable = exports.ArgumentsSymbol = exports.LexerPredicateSymbol = exports.ParserPredicateSymbol = exports.LexerActionSymbol = exports.ParserActionSymbol = exports.FinallyActionSymbol = exports.ExceptionActionSymbol = exports.LocalNamedActionSymbol = exports.GlobalNamedActionSymbol = exports.LexerCommandSymbol = exports.TerminalSymbol = exports.OperatorSymbol = exports.ArgumentSymbol = exports.OptionsSymbol = exports.EbnfSuffixSymbol = exports.AlternativeSymbol = exports.RuleReferenceSymbol = exports.RuleSymbol = exports.TokenChannelSymbol = exports.BuiltInChannelSymbol = exports.LexerModeSymbol = exports.BuiltInModeSymbol = exports.TokenReferenceSymbol = exports.TokenSymbol = exports.FragmentTokenSymbol = exports.VirtualTokenSymbol = exports.BuiltInTokenSymbol = exports.ImportSymbol = exports.OptionSymbol = void 0;
const antlr4_c3_1 = require("antlr4-c3");
const types_1 = require("./types");
const SourceContext_1 = require("./SourceContext");
class OptionSymbol extends antlr4_c3_1.BaseSymbol {
    value;
}
exports.OptionSymbol = OptionSymbol;
class ImportSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.ImportSymbol = ImportSymbol;
class BuiltInTokenSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.BuiltInTokenSymbol = BuiltInTokenSymbol;
class VirtualTokenSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.VirtualTokenSymbol = VirtualTokenSymbol;
class FragmentTokenSymbol extends antlr4_c3_1.ScopedSymbol {
}
exports.FragmentTokenSymbol = FragmentTokenSymbol;
class TokenSymbol extends antlr4_c3_1.ScopedSymbol {
}
exports.TokenSymbol = TokenSymbol;
class TokenReferenceSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.TokenReferenceSymbol = TokenReferenceSymbol;
class BuiltInModeSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.BuiltInModeSymbol = BuiltInModeSymbol;
class LexerModeSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.LexerModeSymbol = LexerModeSymbol;
class BuiltInChannelSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.BuiltInChannelSymbol = BuiltInChannelSymbol;
class TokenChannelSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.TokenChannelSymbol = TokenChannelSymbol;
class RuleSymbol extends antlr4_c3_1.ScopedSymbol {
}
exports.RuleSymbol = RuleSymbol;
class RuleReferenceSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.RuleReferenceSymbol = RuleReferenceSymbol;
class AlternativeSymbol extends antlr4_c3_1.ScopedSymbol {
}
exports.AlternativeSymbol = AlternativeSymbol;
class EbnfSuffixSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.EbnfSuffixSymbol = EbnfSuffixSymbol;
class OptionsSymbol extends antlr4_c3_1.ScopedSymbol {
}
exports.OptionsSymbol = OptionsSymbol;
class ArgumentSymbol extends antlr4_c3_1.ScopedSymbol {
}
exports.ArgumentSymbol = ArgumentSymbol;
class OperatorSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.OperatorSymbol = OperatorSymbol;
class TerminalSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.TerminalSymbol = TerminalSymbol;
class LexerCommandSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.LexerCommandSymbol = LexerCommandSymbol;
class GlobalNamedActionSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.GlobalNamedActionSymbol = GlobalNamedActionSymbol;
class LocalNamedActionSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.LocalNamedActionSymbol = LocalNamedActionSymbol;
class ExceptionActionSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.ExceptionActionSymbol = ExceptionActionSymbol;
class FinallyActionSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.FinallyActionSymbol = FinallyActionSymbol;
class ParserActionSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.ParserActionSymbol = ParserActionSymbol;
class LexerActionSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.LexerActionSymbol = LexerActionSymbol;
class ParserPredicateSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.ParserPredicateSymbol = ParserPredicateSymbol;
class LexerPredicateSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.LexerPredicateSymbol = LexerPredicateSymbol;
class ArgumentsSymbol extends antlr4_c3_1.BaseSymbol {
}
exports.ArgumentsSymbol = ArgumentsSymbol;
class ContextSymbolTable extends antlr4_c3_1.SymbolTable {
    owner;
    tree;
    symbolReferences = new Map();
    namedActions = [];
    parserActions = [];
    lexerActions = [];
    parserPredicates = [];
    lexerPredicates = [];
    constructor(name, options, owner) {
        super(name, options);
        this.owner = owner;
    }
    clear() {
        if (this.owner) {
            for (const dep of this.dependencies) {
                if (dep.owner) {
                    this.owner.removeDependency(dep.owner);
                }
            }
        }
        this.symbolReferences.clear();
        this.namedActions = [];
        this.parserActions = [];
        this.lexerActions = [];
        this.parserPredicates = [];
        this.lexerPredicates = [];
        super.clear();
    }
    symbolExists(name, kind, localOnly) {
        return this.getSymbolOfType(name, kind, localOnly) !== undefined;
    }
    symbolExistsInGroup(symbol, kind, localOnly) {
        switch (kind) {
            case types_1.SymbolGroupKind.TokenRef: {
                if (this.symbolExists(symbol, types_1.SymbolKind.BuiltInLexerToken, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, types_1.SymbolKind.VirtualLexerToken, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, types_1.SymbolKind.FragmentLexerToken, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, types_1.SymbolKind.LexerRule, localOnly)) {
                    return true;
                }
                break;
            }
            case types_1.SymbolGroupKind.LexerMode: {
                if (this.symbolExists(symbol, types_1.SymbolKind.BuiltInMode, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, types_1.SymbolKind.LexerMode, localOnly)) {
                    return true;
                }
                break;
            }
            case types_1.SymbolGroupKind.TokenChannel: {
                if (this.symbolExists(symbol, types_1.SymbolKind.BuiltInChannel, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, types_1.SymbolKind.TokenChannel, localOnly)) {
                    return true;
                }
                break;
            }
            case types_1.SymbolGroupKind.RuleRef: {
                if (this.symbolExists(symbol, types_1.SymbolKind.ParserRule, localOnly)) {
                    return true;
                }
                break;
            }
            default: {
                break;
            }
        }
        return false;
    }
    contextForSymbol(symbolName, kind, localOnly) {
        const symbol = this.getSymbolOfType(symbolName, kind, localOnly);
        if (!symbol) {
            return undefined;
        }
        return symbol.context;
    }
    getSymbolInfo(symbol) {
        if (!(symbol instanceof antlr4_c3_1.BaseSymbol)) {
            const temp = this.resolveSync(symbol);
            if (!temp) {
                return undefined;
            }
            symbol = temp;
        }
        let kind = SourceContext_1.SourceContext.getKindFromSymbol(symbol);
        const name = symbol.name;
        switch (kind) {
            case types_1.SymbolKind.TokenVocab:
            case types_1.SymbolKind.Import: {
                this.dependencies.forEach((table) => {
                    if (table.owner && table.owner.sourceId.includes(name)) {
                        return {
                            kind,
                            name,
                            source: table.owner.fileName,
                            definition: SourceContext_1.SourceContext.definitionForContext(table.tree, true),
                        };
                    }
                });
                break;
            }
            case types_1.SymbolKind.Terminal: {
                this.dependencies.forEach((table) => {
                    const actualSymbol = table.resolveSync(name);
                    if (actualSymbol) {
                        symbol = actualSymbol;
                        kind = SourceContext_1.SourceContext.getKindFromSymbol(actualSymbol);
                    }
                });
                break;
            }
            default: {
                break;
            }
        }
        const symbolTable = symbol.symbolTable;
        return {
            kind,
            name,
            source: (symbol.context && symbolTable && symbolTable.owner) ? symbolTable.owner.fileName : "ANTLR runtime",
            definition: SourceContext_1.SourceContext.definitionForContext(symbol.context, true),
            description: undefined,
        };
    }
    listTopLevelSymbols(localOnly) {
        const result = [];
        const options = this.resolveSync("options", true);
        if (options) {
            const tokenVocab = options.resolveSync("tokenVocab", true);
            if (tokenVocab) {
                const value = this.getSymbolInfo(tokenVocab);
                if (value) {
                    result.push(value);
                }
            }
        }
        let symbols = this.symbolsOfType(ImportSymbol, localOnly);
        result.push(...symbols);
        symbols = this.symbolsOfType(BuiltInTokenSymbol, localOnly);
        result.push(...symbols);
        symbols = this.symbolsOfType(VirtualTokenSymbol, localOnly);
        result.push(...symbols);
        symbols = this.symbolsOfType(FragmentTokenSymbol, localOnly);
        result.push(...symbols);
        symbols = this.symbolsOfType(TokenSymbol, localOnly);
        result.push(...symbols);
        symbols = this.symbolsOfType(BuiltInModeSymbol, localOnly);
        result.push(...symbols);
        symbols = this.symbolsOfType(LexerModeSymbol, localOnly);
        result.push(...symbols);
        symbols = this.symbolsOfType(BuiltInChannelSymbol, localOnly);
        result.push(...symbols);
        symbols = this.symbolsOfType(TokenChannelSymbol, localOnly);
        result.push(...symbols);
        symbols = this.symbolsOfType(RuleSymbol, localOnly);
        result.push(...symbols);
        return result;
    }
    listActions(type) {
        const result = [];
        try {
            const list = this.actionListOfType(type);
            for (const entry of list) {
                const definition = SourceContext_1.SourceContext.definitionForContext(entry.context, true);
                if (definition && entry.name.toLowerCase() === "skip") {
                    definition.range.end.column = definition.range.start.column + 3;
                }
                result.push({
                    kind: SourceContext_1.SourceContext.getKindFromSymbol(entry),
                    name: entry.name,
                    source: this.owner ? this.owner.fileName : "",
                    definition,
                    description: entry.context.text,
                });
            }
        }
        catch (e) {
            result.push({
                kind: types_1.SymbolKind.Unknown,
                name: "Error getting actions list",
                description: "Internal error occurred while collecting the list of defined actions",
                source: "",
            });
        }
        return result;
    }
    getActionCounts() {
        const result = new Map();
        let list = this.namedActions.filter((symbol) => {
            return symbol instanceof LocalNamedActionSymbol;
        });
        result.set(types_1.CodeActionType.LocalNamed, list.length);
        list = this.namedActions.filter((symbol) => {
            return symbol instanceof GlobalNamedActionSymbol;
        });
        result.set(types_1.CodeActionType.GlobalNamed, list.length);
        result.set(types_1.CodeActionType.ParserAction, this.parserActions.length);
        result.set(types_1.CodeActionType.LexerAction, this.lexerActions.length);
        result.set(types_1.CodeActionType.ParserPredicate, this.parserPredicates.length);
        result.set(types_1.CodeActionType.LexerPredicate, this.lexerPredicates.length);
        return result;
    }
    getReferenceCount(symbolName) {
        const reference = this.symbolReferences.get(symbolName);
        if (reference) {
            return reference;
        }
        else {
            return 0;
        }
    }
    getUnreferencedSymbols() {
        const result = [];
        for (const entry of this.symbolReferences) {
            if (entry[1] === 0) {
                result.push(entry[0]);
            }
        }
        return result;
    }
    incrementSymbolRefCount(symbolName) {
        const reference = this.symbolReferences.get(symbolName);
        if (reference) {
            this.symbolReferences.set(symbolName, reference + 1);
        }
        else {
            this.symbolReferences.set(symbolName, 1);
        }
    }
    getSymbolOccurrences(symbolName, localOnly) {
        const result = [];
        const symbols = this.getAllSymbolsSync(antlr4_c3_1.BaseSymbol, localOnly);
        for (const symbol of symbols) {
            const owner = symbol.root.owner;
            if (owner) {
                if (symbol.context && symbol.name === symbolName) {
                    let context = symbol.context;
                    if (symbol instanceof FragmentTokenSymbol) {
                        context = symbol.context.children[1];
                    }
                    else if (symbol instanceof TokenSymbol || symbol instanceof RuleSymbol) {
                        context = symbol.context.children[0];
                    }
                    result.push({
                        kind: SourceContext_1.SourceContext.getKindFromSymbol(symbol),
                        name: symbolName,
                        source: owner.fileName,
                        definition: SourceContext_1.SourceContext.definitionForContext(context, true),
                        description: undefined,
                    });
                }
                if (symbol instanceof antlr4_c3_1.ScopedSymbol) {
                    const references = symbol.getAllNestedSymbolsSync(symbolName);
                    for (const reference of references) {
                        result.push({
                            kind: SourceContext_1.SourceContext.getKindFromSymbol(reference),
                            name: symbolName,
                            source: owner.fileName,
                            definition: SourceContext_1.SourceContext.definitionForContext(reference.context, true),
                            description: undefined,
                        });
                    }
                }
            }
        }
        return result;
    }
    defineNamedAction(action) {
        this.namedActions.push(action);
    }
    defineParserAction(action) {
        this.parserActions.push(action);
    }
    defineLexerAction(action) {
        this.lexerActions.push(action);
    }
    definePredicate(predicate) {
        if (predicate instanceof LexerPredicateSymbol) {
            this.lexerPredicates.push(predicate);
        }
        else {
            this.parserPredicates.push(predicate);
        }
    }
    symbolContainingContext(context) {
        const findRecursive = (parent) => {
            for (const symbol of parent.children) {
                if (!symbol.context) {
                    continue;
                }
                if (symbol.context.sourceInterval.properlyContains(context.sourceInterval)) {
                    let child;
                    if (symbol instanceof antlr4_c3_1.ScopedSymbol) {
                        child = findRecursive(symbol);
                    }
                    if (child) {
                        return child;
                    }
                    else {
                        return symbol;
                    }
                }
            }
        };
        return findRecursive(this);
    }
    actionListOfType(type) {
        switch (type) {
            case types_1.CodeActionType.LocalNamed: {
                return this.namedActions.filter((symbol) => {
                    return symbol instanceof LocalNamedActionSymbol;
                });
            }
            case types_1.CodeActionType.ParserAction: {
                return this.parserActions;
            }
            case types_1.CodeActionType.LexerAction: {
                return this.lexerActions;
            }
            case types_1.CodeActionType.ParserPredicate: {
                return this.parserPredicates;
            }
            case types_1.CodeActionType.LexerPredicate: {
                return this.lexerPredicates;
            }
            default: {
                return this.namedActions.filter((symbol) => {
                    return symbol instanceof GlobalNamedActionSymbol;
                });
            }
        }
    }
    symbolsOfType(t, localOnly = false) {
        const result = [];
        const symbols = this.getAllSymbolsSync(t, localOnly);
        const filtered = new Set(symbols);
        for (const symbol of filtered) {
            const root = symbol.root;
            result.push({
                kind: SourceContext_1.SourceContext.getKindFromSymbol(symbol),
                name: symbol.name,
                source: root.owner ? root.owner.fileName : "ANTLR runtime",
                definition: SourceContext_1.SourceContext.definitionForContext(symbol.context, true),
                description: undefined,
            });
        }
        return result;
    }
    getSymbolOfType(name, kind, localOnly) {
        switch (kind) {
            case types_1.SymbolKind.TokenVocab: {
                const options = this.resolveSync("options", true);
                if (options) {
                    return options.resolveSync(name, localOnly);
                }
                break;
            }
            case types_1.SymbolKind.Import: {
                return this.resolveSync(name, localOnly);
            }
            case types_1.SymbolKind.BuiltInLexerToken: {
                return this.resolveSync(name, localOnly);
            }
            case types_1.SymbolKind.VirtualLexerToken: {
                return this.resolveSync(name, localOnly);
            }
            case types_1.SymbolKind.FragmentLexerToken: {
                return this.resolveSync(name, localOnly);
            }
            case types_1.SymbolKind.LexerRule: {
                return this.resolveSync(name, localOnly);
            }
            case types_1.SymbolKind.BuiltInMode: {
                return this.resolveSync(name, localOnly);
            }
            case types_1.SymbolKind.LexerMode: {
                return this.resolveSync(name, localOnly);
            }
            case types_1.SymbolKind.BuiltInChannel: {
                return this.resolveSync(name, localOnly);
            }
            case types_1.SymbolKind.TokenChannel: {
                return this.resolveSync(name, localOnly);
            }
            case types_1.SymbolKind.ParserRule: {
                return this.resolveSync(name, localOnly);
            }
            default:
        }
        return undefined;
    }
}
exports.ContextSymbolTable = ContextSymbolTable;
//# sourceMappingURL=ContextSymbolTable.js.map
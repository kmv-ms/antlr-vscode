"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntlrFacade = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const SourceContext_1 = require("./SourceContext");
const GrammarDebugger_1 = require("./GrammarDebugger");
class AntlrFacade {
    importDir;
    extensionDir;
    sourceContexts = new Map();
    constructor(importDir, extensionDir) {
        this.importDir = importDir;
        this.extensionDir = extensionDir;
    }
    getSelfDiagnostics() {
        return {
            contextCount: this.sourceContexts.keys.length,
        };
    }
    getContext(fileName, source) {
        const contextEntry = this.sourceContexts.get(fileName);
        if (!contextEntry) {
            return this.loadGrammar(fileName, source);
        }
        return contextEntry.context;
    }
    setText(fileName, source) {
        const contextEntry = this.sourceContexts.get(fileName);
        if (contextEntry) {
            contextEntry.context.setText(source);
        }
    }
    reparse(fileName) {
        const contextEntry = this.sourceContexts.get(fileName);
        if (contextEntry) {
            this.parseGrammar(contextEntry);
        }
    }
    loadGrammar(fileName, source) {
        let contextEntry = this.sourceContexts.get(fileName);
        if (!contextEntry) {
            if (!source) {
                try {
                    fs.statSync(fileName);
                    source = fs.readFileSync(fileName, "utf8");
                }
                catch (e) {
                    source = "";
                }
            }
            const context = new SourceContext_1.SourceContext(fileName, this.extensionDir);
            contextEntry = { context, refCount: 0, dependencies: [], grammar: fileName };
            this.sourceContexts.set(fileName, contextEntry);
            context.setText(source);
            this.parseGrammar(contextEntry);
        }
        contextEntry.refCount++;
        return contextEntry.context;
    }
    releaseGrammar(fileName) {
        this.internalReleaseGrammar(fileName);
    }
    symbolInfoAtPosition(fileName, column, row, limitToChildren = true) {
        const context = this.getContext(fileName);
        return context.symbolAtPosition(column, row, limitToChildren);
    }
    infoForSymbol(fileName, symbol) {
        const context = this.getContext(fileName);
        return context.getSymbolInfo(symbol);
    }
    enclosingSymbolAtPosition(fileName, column, row, ruleScope = false) {
        const context = this.getContext(fileName);
        return context.enclosingSymbolAtPosition(column, row, ruleScope);
    }
    listTopLevelSymbols(fileName, fullList) {
        const context = this.getContext(fileName);
        return context.listTopLevelSymbols(!fullList);
    }
    getLexerVocabulary(fileName) {
        const context = this.getContext(fileName);
        return context.getVocabulary();
    }
    getRuleList(fileName) {
        const context = this.getContext(fileName);
        return context.getRuleList();
    }
    getChannels(fileName) {
        const context = this.getContext(fileName);
        return context.getChannels();
    }
    getModes(fileName) {
        const context = this.getContext(fileName);
        return context.getModes();
    }
    listActions(fileName, type) {
        const context = this.getContext(fileName);
        return context.listActions(type);
    }
    getActionCounts(fileName) {
        const context = this.getContext(fileName);
        return context.getActionCounts();
    }
    async getCodeCompletionCandidates(fileName, column, row) {
        const context = this.getContext(fileName);
        return context.getCodeCompletionCandidates(column, row);
    }
    getDiagnostics(fileName) {
        const context = this.getContext(fileName);
        return context.getDiagnostics();
    }
    ruleFromPosition(fileName, column, row) {
        const context = this.getContext(fileName);
        return context.ruleFromPosition(column, row);
    }
    countReferences(fileName, symbol) {
        const context = this.getContext(fileName);
        return context.getReferenceCount(symbol);
    }
    getSymbolOccurrences(fileName, symbolName) {
        const context = this.getContext(fileName);
        const result = context.symbolTable.getSymbolOccurrences(symbolName, false);
        return result.sort((lhs, rhs) => {
            return lhs.kind - rhs.kind;
        });
    }
    getDependencies(fileName) {
        const entry = this.sourceContexts.get(fileName);
        if (!entry) {
            return [];
        }
        const dependencies = new Set();
        this.pushDependencyFiles(entry, dependencies);
        const result = [];
        for (const dep of dependencies) {
            result.push(dep.fileName);
        }
        return result;
    }
    getReferenceGraph(fileName) {
        const context = this.getContext(fileName);
        return context.getReferenceGraph();
    }
    getRRDScript(fileName, rule) {
        const context = this.getContext(fileName);
        return context.getRRDScript(rule) || "";
    }
    generate(fileName, options) {
        const context = this.getContext(fileName);
        const dependencies = new Set();
        this.pushDependencyFiles(this.sourceContexts.get(fileName), dependencies);
        return context.generate(dependencies, options);
    }
    getATNGraph(fileName, rule) {
        const context = this.getContext(fileName);
        return context.getATNGraph(rule);
    }
    generateSentence(fileName, rule, options, callback) {
        const context = this.getContext(fileName);
        const dependencies = new Set();
        this.pushDependencyFiles(this.sourceContexts.get(fileName), dependencies);
        const basePath = path.dirname(fileName);
        for (const dependency of dependencies) {
            if (dependency.hasErrors) {
                callback("[Fix grammar errors first]", 0);
                return;
            }
            if (!dependency.isInterpreterDataLoaded) {
                const errors = dependency.setupInterpreters(path.join(basePath, ".antlr"));
                if (errors.length > 0) {
                    callback(errors, 0);
                }
            }
        }
        context.generateSentence(dependencies, rule, options, callback);
    }
    lexTestInput(fileName, input, actionFile) {
        const context = this.getContext(fileName);
        return context.lexTestInput(input, actionFile);
    }
    parseTestInput(fileName, input, startRule, actionFile) {
        const context = this.getContext(fileName);
        return context.parseTestInput(input, startRule, actionFile);
    }
    formatGrammar(fileName, options, start, stop) {
        const context = this.getContext(fileName);
        return context.formatGrammar(options, start, stop);
    }
    hasErrors(fileName) {
        const context = this.getContext(fileName);
        return context.hasErrors;
    }
    createDebugger(fileName, actionFile, dataDir) {
        const context = this.getContext(fileName);
        if (!context) {
            return;
        }
        const contexts = new Set();
        contexts.add(context);
        this.pushDependencyFiles(this.sourceContexts.get(fileName), contexts);
        for (const dependency of contexts) {
            if (dependency.hasErrors) {
                return;
            }
            if (!dependency.isInterpreterDataLoaded) {
                const errors = dependency.setupInterpreters(dataDir);
                if (errors.length > 0) {
                    return;
                }
            }
        }
        return new GrammarDebugger_1.GrammarDebugger([...contexts], actionFile);
    }
    getContextDetails(fileName) {
        const context = this.getContext(fileName);
        return context.info;
    }
    loadDependency(contextEntry, depName) {
        const basePath = path.dirname(contextEntry.grammar);
        const fullPath = path.isAbsolute(this.importDir) ? this.importDir : path.join(basePath, this.importDir);
        try {
            const depPath = path.join(fullPath, depName + ".g4");
            fs.accessSync(depPath, fs.constants.R_OK);
            contextEntry.dependencies.push(depPath);
            return this.loadGrammar(depPath);
        }
        catch (e) {
        }
        try {
            const depPath = path.join(fullPath, depName + ".g");
            fs.accessSync(depPath, fs.constants.R_OK);
            contextEntry.dependencies.push(depPath);
            return this.loadGrammar(depPath);
        }
        catch (e) {
        }
        try {
            const depPath = path.join(basePath, depName + ".g4");
            fs.statSync(depPath);
            contextEntry.dependencies.push(depPath);
            return this.loadGrammar(depPath);
        }
        catch (e) {
        }
        try {
            const depPath = path.join(basePath, depName + ".g");
            fs.statSync(depPath);
            contextEntry.dependencies.push(depPath);
            return this.loadGrammar(depPath);
        }
        catch (e) {
        }
        return undefined;
    }
    parseGrammar(contextEntry) {
        const oldDependencies = contextEntry.dependencies;
        contextEntry.dependencies = [];
        const newDependencies = contextEntry.context.parse();
        for (const dep of newDependencies) {
            const depContext = this.loadDependency(contextEntry, dep);
            if (depContext) {
                contextEntry.context.addAsReferenceTo(depContext);
            }
        }
        for (const dep of oldDependencies) {
            this.releaseGrammar(dep);
        }
    }
    internalReleaseGrammar(fileName, referencing) {
        const contextEntry = this.sourceContexts.get(fileName);
        if (contextEntry) {
            if (referencing) {
                referencing.context.removeDependency(contextEntry.context);
            }
            contextEntry.refCount--;
            if (contextEntry.refCount === 0) {
                this.sourceContexts.delete(fileName);
                for (const dep of contextEntry.dependencies) {
                    this.internalReleaseGrammar(dep, contextEntry);
                }
            }
        }
    }
    pushDependencyFiles(entry, contexts) {
        for (const dep of entry.dependencies) {
            const depEntry = this.sourceContexts.get(dep);
            if (depEntry) {
                this.pushDependencyFiles(depEntry, contexts);
                contexts.add(depEntry.context);
            }
        }
    }
}
exports.AntlrFacade = AntlrFacade;
//# sourceMappingURL=facade.js.map
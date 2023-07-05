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
exports.ExtensionHost = exports.printErrors = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const vscode_1 = require("vscode");
const facade_1 = require("./backend/facade");
const types_1 = require("./backend/types");
const FrontendUtils_1 = require("./frontend/FrontendUtils");
const ProgressIndicator_1 = require("./frontend/ProgressIndicator");
const AntlrDebugConfigurationProvider_1 = require("./AntlrDebugConfigurationProvider");
const ActionsProvider_1 = require("./frontend/ActionsProvider");
const ATNGraphProvider_1 = require("./frontend/webviews/ATNGraphProvider");
const CallGraphProvider_1 = require("./frontend/webviews/CallGraphProvider");
const RailroadDiagramProvider_1 = require("./frontend/webviews/RailroadDiagramProvider");
const ParseTreeProvider_1 = require("./frontend/webviews/ParseTreeProvider");
const ChannelsProvider_1 = require("./frontend/ChannelsProvider");
const CodeLensProvider_1 = require("./frontend/CodeLensProvider");
const CompletionItemProvider_1 = require("./frontend/CompletionItemProvider");
const DefinitionProvider_1 = require("./frontend/DefinitionProvider");
const FormattingProvider_1 = require("./frontend/FormattingProvider");
const HoverProvider_1 = require("./frontend/HoverProvider");
const ImportsProvider_1 = require("./frontend/ImportsProvider");
const LexerSymbolsProvider_1 = require("./frontend/LexerSymbolsProvider");
const ModesProvider_1 = require("./frontend/ModesProvider");
const ParserSymbolsProvider_1 = require("./frontend/ParserSymbolsProvider");
const ReferenceProvider_1 = require("./frontend/ReferenceProvider");
const RenameProvider_1 = require("./frontend/RenameProvider");
const SymbolProvider_1 = require("./frontend/SymbolProvider");
const errorOutputChannel = vscode_1.window.createOutputChannel("ANTLR4 Errors");
const printErrors = (lines, revealOutput) => {
    lines.forEach((line) => {
        if (typeof line === "string") {
            errorOutputChannel.appendLine(line);
        }
        else if (line instanceof Error) {
            errorOutputChannel.appendLine(line.stack ?? line.message);
        }
        else {
            errorOutputChannel.appendLine(String(line));
        }
    });
    if (revealOutput) {
        errorOutputChannel.show(true);
    }
};
exports.printErrors = printErrors;
class ExtensionHost {
    static diagnosticMap = new Map([
        [types_1.DiagnosticType.Hint, vscode_1.DiagnosticSeverity.Hint],
        [types_1.DiagnosticType.Info, vscode_1.DiagnosticSeverity.Information],
        [types_1.DiagnosticType.Warning, vscode_1.DiagnosticSeverity.Warning],
        [types_1.DiagnosticType.Error, vscode_1.DiagnosticSeverity.Error],
    ]);
    static antlrSelector = { language: "antlr", scheme: "file" };
    static diagnosticTypeMap = new Map();
    importDir;
    backend;
    progress = new ProgressIndicator_1.ProgressIndicator();
    diagnosticCollection = vscode_1.languages.createDiagnosticCollection("antlr");
    importsProvider;
    lexerSymbolsProvider;
    parserSymbolsProvider;
    channelsProvider;
    modesProvider;
    actionsProvider;
    parseTreeProvider;
    codeLensProvider;
    diagramProvider;
    atnGraphProvider;
    callGraphProvider;
    changeTimers = new Map();
    constructor(context) {
        this.importDir = vscode_1.workspace.getConfiguration("antlr4.generation").importDir;
        this.backend = new facade_1.AntlrFacade(this.importDir ?? "", context.extensionPath);
        this.importsProvider = new ImportsProvider_1.ImportsProvider(this.backend);
        context.subscriptions.push(vscode_1.window.registerTreeDataProvider("antlr4.imports", this.importsProvider));
        this.lexerSymbolsProvider = new LexerSymbolsProvider_1.LexerSymbolsProvider(this.backend);
        context.subscriptions.push(vscode_1.window.registerTreeDataProvider("antlr4.lexerSymbols", this.lexerSymbolsProvider));
        this.parserSymbolsProvider = new ParserSymbolsProvider_1.ParserSymbolsProvider(this.backend);
        context.subscriptions.push(vscode_1.window.registerTreeDataProvider("antlr4.parserSymbols", this.parserSymbolsProvider));
        this.channelsProvider = new ChannelsProvider_1.ChannelsProvider(this.backend);
        context.subscriptions.push(vscode_1.window.registerTreeDataProvider("antlr4.channels", this.channelsProvider));
        this.modesProvider = new ModesProvider_1.ModesProvider(this.backend);
        context.subscriptions.push(vscode_1.window.registerTreeDataProvider("antlr4.modes", this.modesProvider));
        this.actionsProvider = new ActionsProvider_1.ActionsProvider(this.backend);
        this.actionsProvider.actionTree = vscode_1.window.createTreeView("antlr4.actions", { treeDataProvider: this.actionsProvider });
        this.parseTreeProvider = new ParseTreeProvider_1.ParseTreeProvider(this.backend, context);
        this.diagramProvider = new RailroadDiagramProvider_1.RailroadDiagramProvider(this.backend, context);
        this.atnGraphProvider = new ATNGraphProvider_1.ATNGraphProvider(this.backend, context);
        this.callGraphProvider = new CallGraphProvider_1.CallGraphProvider(this.backend, context);
        const editor = vscode_1.window.activeTextEditor;
        if (editor && FrontendUtils_1.FrontendUtils.isGrammarFile(editor.document)) {
            FrontendUtils_1.FrontendUtils.updateVsCodeContext(this.backend, editor.document);
            this.updateTreeProviders(editor.document);
        }
        this.registerEventHandlers();
        this.addSubscriptions(context);
        const doNotGenerate = vscode_1.workspace.getConfiguration("antlr4.generation").mode === "none";
        for (const document of vscode_1.workspace.textDocuments) {
            if (FrontendUtils_1.FrontendUtils.isGrammarFile(document)) {
                const antlrPath = path.join(path.dirname(document.fileName), ".antlr");
                try {
                    void this.backend.generate(document.fileName, { outputDir: antlrPath, loadOnly: true, generateIfNeeded: !doNotGenerate });
                    ATNGraphProvider_1.ATNGraphProvider.addStatesForGrammar(antlrPath, document.fileName);
                }
                catch (error) {
                    (0, exports.printErrors)([error], true);
                }
            }
        }
    }
    shutDown() {
    }
    addSubscriptions(context) {
        context.subscriptions.push(vscode_1.languages.registerHoverProvider(ExtensionHost.antlrSelector, new HoverProvider_1.AntlrHoverProvider(this.backend)));
        context.subscriptions.push(vscode_1.languages.registerDefinitionProvider(ExtensionHost.antlrSelector, new DefinitionProvider_1.AntlrDefinitionProvider(this.backend)));
        context.subscriptions.push(vscode_1.languages.registerDocumentSymbolProvider(ExtensionHost.antlrSelector, new SymbolProvider_1.AntlrSymbolProvider(this.backend)));
        this.codeLensProvider = new CodeLensProvider_1.AntlrCodeLensProvider(this.backend);
        context.subscriptions.push(vscode_1.languages.registerCodeLensProvider(ExtensionHost.antlrSelector, this.codeLensProvider));
        context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(ExtensionHost.antlrSelector, new CompletionItemProvider_1.AntlrCompletionItemProvider(this.backend), " ", ":", "@", "<", "{", "["));
        context.subscriptions.push(vscode_1.languages.registerDocumentRangeFormattingEditProvider(ExtensionHost.antlrSelector, new FormattingProvider_1.AntlrFormattingProvider(this.backend)));
        context.subscriptions.push(vscode_1.languages.registerRenameProvider(ExtensionHost.antlrSelector, new RenameProvider_1.AntlrRenameProvider(this.backend)));
        context.subscriptions.push(vscode_1.languages.registerReferenceProvider(ExtensionHost.antlrSelector, new ReferenceProvider_1.AntlrReferenceProvider(this.backend)));
        context.subscriptions.push(vscode_1.commands.registerTextEditorCommand("antlr.rrd.singleRule", (textEditor, _edit) => {
            this.diagramProvider.showWebview(textEditor.document.uri, {
                title: "RRD: " + path.basename(textEditor.document.fileName),
                fullList: false,
            });
        }));
        context.subscriptions.push(vscode_1.commands.registerTextEditorCommand("antlr.rrd.allRules", (textEditor, _edit) => {
            this.diagramProvider.showWebview(textEditor.document.uri, {
                title: "RRD: " + path.basename(textEditor.document.fileName),
                fullList: true,
            });
        }));
        context.subscriptions.push(vscode_1.commands.registerTextEditorCommand("antlr.atn.singleRule", (textEditor, _edit) => {
            this.atnGraphProvider.showWebview(textEditor.document.uri, {
                title: "ATN: " + path.basename(textEditor.document.fileName),
            });
        }));
        context.subscriptions.push(vscode_1.commands.registerTextEditorCommand("antlr.call-graph", (textEditor, _edit) => {
            this.callGraphProvider.showWebview(textEditor.document.uri, {
                title: "Call Graph: " + path.basename(textEditor.document.fileName),
            });
        }));
        const sentenceOutputChannel = vscode_1.window.createOutputChannel("ANTLR4 Sentence Generation");
        context.subscriptions.push(vscode_1.commands.registerTextEditorCommand("antlr.tools.generateSentences", (textEditor, _edit) => {
            const grammarFileName = textEditor.document.uri.fsPath;
            const configFileName = grammarFileName.replace(path.extname(grammarFileName), ".json");
            let config = {};
            if (fs.existsSync(configFileName)) {
                const content = fs.readFileSync(configFileName, "utf-8");
                try {
                    config = JSON.parse(content);
                }
                catch (reason) {
                    (0, exports.printErrors)(["Cannot parse sentence generation config file:", reason], true);
                    return;
                }
            }
            if (typeof config.actionFile === "string" && config.actionFile.length > 0) {
                if (!path.isAbsolute(config.actionFile)) {
                    config.actionFile = path.join(path.dirname(grammarFileName), config.actionFile);
                }
            }
            const caret = textEditor.selection.active;
            const [ruleName] = this.backend.ruleFromPosition(grammarFileName, caret.character, caret.line + 1);
            if (!ruleName) {
                (0, exports.printErrors)(["ANTLR4 sentence generation: no rule selected"], true);
                return;
            }
            if (config.clear) {
                sentenceOutputChannel.clear();
            }
            this.backend.generateSentence(grammarFileName, ruleName, config, (sentence, index) => {
                sentenceOutputChannel.appendLine(`${index}) ${sentence}`);
                sentenceOutputChannel.show(true);
            });
        }));
        context.subscriptions.push(vscode_1.debug.registerDebugConfigurationProvider("antlr-debug", new AntlrDebugConfigurationProvider_1.AntlrDebugConfigurationProvider(this.backend, this.parseTreeProvider)));
        context.subscriptions.push(vscode_1.commands.registerCommand("antlr.openGrammar", (grammar) => {
            void vscode_1.workspace.openTextDocument(grammar).then((document) => {
                return vscode_1.window.showTextDocument(document, vscode_1.ViewColumn.Active, false);
            });
        }));
        context.subscriptions.push(vscode_1.commands.registerCommand("antlr.selectGrammarRange", (range) => {
            if (vscode_1.window.activeTextEditor) {
                vscode_1.window.activeTextEditor.selection = new vscode_1.Selection(range.start.row - 1, range.start.column, range.end.row - 1, range.end.column + 1);
                vscode_1.window.activeTextEditor.revealRange(new vscode_1.Range(range.start.row - 1, range.start.column, range.end.row - 1, range.end.column + 1), vscode_1.TextEditorRevealType.InCenterIfOutsideViewport);
            }
        }));
    }
    registerEventHandlers() {
        vscode_1.workspace.onDidOpenTextDocument((document) => {
            if (FrontendUtils_1.FrontendUtils.isGrammarFile(document)) {
                this.backend.loadGrammar(document.fileName);
                this.regenerateBackgroundData(document);
            }
        });
        vscode_1.workspace.onDidCloseTextDocument((document) => {
            if (FrontendUtils_1.FrontendUtils.isGrammarFile(document)) {
                this.backend.releaseGrammar(document.fileName);
                this.diagnosticCollection.set(document.uri, []);
            }
        });
        vscode_1.workspace.onDidChangeTextDocument((event) => {
            if (event.contentChanges.length > 0 && FrontendUtils_1.FrontendUtils.isGrammarFile(event.document)) {
                const fileName = event.document.fileName;
                this.backend.setText(fileName, event.document.getText());
                const timer = this.changeTimers.get(fileName);
                if (timer) {
                    clearTimeout(timer);
                }
                this.changeTimers.set(fileName, setTimeout(() => {
                    this.changeTimers.delete(fileName);
                    this.backend.reparse(fileName);
                    this.diagramProvider.update(vscode_1.window.activeTextEditor);
                    this.callGraphProvider.update(vscode_1.window.activeTextEditor);
                    this.processDiagnostic(event.document);
                    this.codeLensProvider.refresh();
                }, 300));
            }
        });
        vscode_1.workspace.onDidSaveTextDocument((document) => {
            if (FrontendUtils_1.FrontendUtils.isGrammarFile(document)) {
                this.regenerateBackgroundData(document);
            }
        });
        vscode_1.window.onDidChangeTextEditorSelection((event) => {
            if (FrontendUtils_1.FrontendUtils.isGrammarFile(event.textEditor.document)) {
                this.diagramProvider.update(event.textEditor);
                this.atnGraphProvider.update(event.textEditor, false);
                this.actionsProvider.update(event.textEditor);
            }
        });
        vscode_1.window.onDidChangeActiveTextEditor((textEditor) => {
            if (textEditor) {
                FrontendUtils_1.FrontendUtils.updateVsCodeContext(this.backend, textEditor.document);
                this.updateTreeProviders(textEditor.document);
            }
        });
    }
    processDiagnostic = (document) => {
        const diagnostics = [];
        const entries = this.backend.getDiagnostics(document.fileName);
        for (const entry of entries) {
            const startRow = entry.range.start.row === 0 ? 0 : entry.range.start.row - 1;
            const endRow = entry.range.end.row === 0 ? 0 : entry.range.end.row - 1;
            const range = new vscode_1.Range(startRow, entry.range.start.column, endRow, entry.range.end.column);
            const diagnostic = new vscode_1.Diagnostic(range, entry.message, ExtensionHost.diagnosticTypeMap.get(entry.type));
            diagnostics.push(diagnostic);
        }
        this.diagnosticCollection.set(document.uri, diagnostics);
    };
    regenerateBackgroundData(document) {
        if (vscode_1.workspace.getConfiguration("antlr4.generation").mode === "none") {
            return;
        }
        const externalMode = vscode_1.workspace.getConfiguration("antlr4.generation").mode === "external";
        this.progress.startAnimation();
        const basePath = path.dirname(document.fileName);
        const antlrPath = path.join(basePath, ".antlr");
        let outputDir = antlrPath;
        if (externalMode) {
            outputDir = vscode_1.workspace.getConfiguration("antlr4.generation").outputDir;
            if (!outputDir) {
                outputDir = basePath;
            }
            else {
                if (!path.isAbsolute(outputDir)) {
                    outputDir = path.join(basePath, outputDir);
                }
            }
        }
        try {
            fs.ensureDirSync(outputDir);
        }
        catch (error) {
            this.progress.stopAnimation();
            void vscode_1.window.showErrorMessage("Cannot create output folder: " + error);
            return;
        }
        const options = {
            baseDir: basePath,
            libDir: vscode_1.workspace.getConfiguration("antlr4.generation").importDir,
            outputDir,
            listeners: false,
            visitors: false,
            alternativeJar: vscode_1.workspace.getConfiguration("antlr4.generation").alternativeJar,
            additionalParameters: vscode_1.workspace.getConfiguration("antlr4.generation").additionalParameters,
        };
        if (externalMode) {
            options.language = vscode_1.workspace.getConfiguration("antlr4.generation").language;
            options.package = vscode_1.workspace.getConfiguration("antlr4.generation").package;
            options.listeners = vscode_1.workspace.getConfiguration("antlr4.generation").listeners;
            options.visitors = vscode_1.workspace.getConfiguration("antlr4.generation").visitors;
        }
        const result = this.backend.generate(document.fileName, options);
        result.then((affectedFiles) => {
            for (const file of affectedFiles) {
                const fullPath = path.resolve(basePath, file);
                vscode_1.workspace.textDocuments.forEach((textDocument) => {
                    if (textDocument.fileName === fullPath) {
                        this.processDiagnostic(textDocument);
                    }
                });
            }
            if (externalMode && antlrPath !== outputDir) {
                try {
                    const files = fs.readdirSync(outputDir);
                    for (const file of files) {
                        if (file.endsWith(".interp")) {
                            const sourceFile = path.join(outputDir, file);
                            fs.moveSync(sourceFile, path.join(antlrPath, file), { overwrite: true });
                        }
                    }
                }
                catch (reason) {
                    this.progress.stopAnimation();
                    (0, exports.printErrors)([reason], true);
                }
            }
            this.backend.generate(document.fileName, { outputDir: antlrPath, loadOnly: true }).then(() => {
                if (vscode_1.window.activeTextEditor?.document.fileName === document.fileName) {
                    this.atnGraphProvider.update(vscode_1.window.activeTextEditor, true);
                }
                this.updateTreeProviders(document);
                this.progress.stopAnimation();
            }).catch((reason) => {
                this.progress.stopAnimation();
                (0, exports.printErrors)([reason], true);
            });
        }).catch((reason) => {
            this.progress.stopAnimation();
            (0, exports.printErrors)([reason], true);
        });
    }
    updateTreeProviders(document) {
        this.lexerSymbolsProvider.refresh(document);
        this.parserSymbolsProvider.refresh(document);
        this.importsProvider.refresh(document);
        this.channelsProvider.refresh(document);
        this.modesProvider.refresh(document);
        this.actionsProvider.refresh(document);
    }
}
exports.ExtensionHost = ExtensionHost;
//# sourceMappingURL=ExtensionHost.js.map
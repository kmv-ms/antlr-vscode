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
exports.AntlrDebugSession = void 0;
const debugadapter_1 = require("@vscode/debugadapter");
const vscode_1 = require("vscode");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const await_notify_1 = require("await-notify");
const ParseTreeProvider_1 = require("./webviews/ParseTreeProvider");
var VarRef;
(function (VarRef) {
    VarRef[VarRef["Globals"] = 1000] = "Globals";
    VarRef[VarRef["ParseTree"] = 1002] = "ParseTree";
    VarRef[VarRef["Context"] = 2000] = "Context";
    VarRef[VarRef["Tokens"] = 3000] = "Tokens";
    VarRef[VarRef["SingleToken"] = 10000] = "SingleToken";
})(VarRef || (VarRef = {}));
class AntlrDebugSession extends debugadapter_1.DebugSession {
    folder;
    backend;
    consumers;
    static threadId = 1;
    debugger;
    parseTreeProvider;
    configurationDone = new await_notify_1.Subject();
    showTextualParseTree = false;
    showGraphicalParseTree = false;
    testInput = "";
    tokens;
    variables;
    constructor(folder, backend, consumers) {
        super();
        this.folder = folder;
        this.backend = backend;
        this.consumers = consumers;
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(false);
        if (consumers[0] instanceof ParseTreeProvider_1.ParseTreeProvider) {
            this.parseTreeProvider = consumers[0];
        }
    }
    shutdown() {
    }
    initializeRequest(response, _args) {
        response.body = {
            supportsConfigurationDoneRequest: true,
            supportsStepInTargetsRequest: true,
            supportsDelayedStackTraceLoading: false,
        };
        this.sendResponse(response);
    }
    configurationDoneRequest(response, args) {
        super.configurationDoneRequest(response, args);
        this.configurationDone.notify();
    }
    launchRequest(response, args) {
        if (!args.input) {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: no test input file specified",
            });
            return;
        }
        if (!path.isAbsolute(args.input) && this.folder) {
            args.input = path.join(this.folder.uri.fsPath, args.input);
        }
        if (!fs.existsSync(args.input)) {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: test input file not found.",
            });
            return;
        }
        if (args.actionFile) {
            if (!path.isAbsolute(args.actionFile) && this.folder) {
                args.actionFile = path.join(this.folder.uri.fsPath, args.actionFile);
            }
            if (!fs.existsSync(args.actionFile)) {
                void vscode_1.window.showInformationMessage("Cannot find file for semantic predicate evaluation. No evaluation will take place.");
            }
        }
        if (!args.grammar) {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: no grammar file specified (use the ${file} macro for the " +
                    "current editor).",
            });
            return;
        }
        if (path.extname(args.grammar) !== ".g4") {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: " + args.grammar + " is not a grammar file",
            });
            return;
        }
        if (!path.isAbsolute(args.grammar) && this.folder) {
            args.grammar = path.join(this.folder.uri.fsPath, args.grammar);
        }
        if (!fs.existsSync(args.grammar)) {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: cannot find grammar file.",
            });
            return;
        }
        if (this.backend.hasErrors(args.grammar)) {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: the grammar contains issues.",
            });
            return;
        }
        try {
            this.setup(args.grammar, args.actionFile);
            for (const consumer of this.consumers) {
                consumer.debugger = this.debugger;
                consumer.updateContent(vscode_1.Uri.file(args.grammar));
            }
            this.sendEvent(new debugadapter_1.InitializedEvent());
        }
        catch (e) {
            this.sendErrorResponse(response, { id: 1, format: "Could not prepare debug session:\n\n" + String(e) });
            return;
        }
        this.configurationDone.wait(1000).then(() => {
            this.showTextualParseTree = args.printParseTree || false;
            this.showGraphicalParseTree = args.visualParseTree || false;
            this.testInput = args.input;
            try {
                const testInput = fs.readFileSync(args.input, { encoding: "utf8" });
                const startRuleIndex = args.startRule ? this.debugger.ruleIndexFromName(args.startRule) : 0;
                if (startRuleIndex < 0) {
                    this.sendErrorResponse(response, {
                        id: 2,
                        format: "Error while launching debug session: start rule \"" + args.startRule + "\" not found",
                    });
                    return;
                }
                this.debugger.start(startRuleIndex, testInput, args.noDebug ? true : false);
            }
            catch (e) {
                this.sendErrorResponse(response, { id: 3, format: "Could not launch debug session:\n\n" + String(e) });
                return;
            }
            this.sendResponse(response);
        });
    }
    setBreakPointsRequest(response, args) {
        this.debugger.clearBreakPoints();
        if (args.breakpoints && args.source.path) {
            const actualBreakpoints = args.breakpoints.map((sourceBreakPoint) => {
                const { validated, line, id } = this.debugger.addBreakPoint(args.source.path, this.convertDebuggerLineToClient(sourceBreakPoint.line));
                const targetBreakPoint = new debugadapter_1.Breakpoint(validated, this.convertClientLineToDebugger(line));
                targetBreakPoint.id = id;
                return targetBreakPoint;
            });
            response.body = {
                breakpoints: actualBreakpoints,
            };
        }
        this.sendResponse(response);
    }
    threadsRequest(response) {
        response.body = {
            threads: [
                new debugadapter_1.Thread(AntlrDebugSession.threadId, "Interpreter"),
            ],
        };
        this.sendResponse(response);
    }
    stackTraceRequest(response, args) {
        if (!this.debugger) {
            response.body = {
                stackFrames: [],
                totalFrames: 0,
            };
            this.sendResponse(response);
            return;
        }
        const startFrame = typeof args.startFrame === "number" ? args.startFrame : 0;
        const maxLevels = typeof args.levels === "number" ? args.levels : 1000;
        const stack = this.debugger.currentStackTrace;
        const frames = [];
        for (let i = startFrame; i < stack.length; ++i) {
            const entry = stack[i];
            let frame;
            if (entry.next.length > 0) {
                frame = new debugadapter_1.StackFrame(i, entry.name, this.createSource(entry.source), this.convertDebuggerLineToClient(entry.next[0].start.row), this.convertDebuggerColumnToClient(entry.next[0].start.column));
                frame.presentationHint = "normal";
            }
            else {
                let line = this.convertDebuggerLineToClient(1);
                let column = this.convertDebuggerColumnToClient(0);
                if (frames.length > 0) {
                    line = frames[frames.length - 1].line;
                    column = frames[frames.length - 1].column;
                }
                frame = new debugadapter_1.StackFrame(i, entry.name + " <missing next>", this.createSource(entry.source), line, column);
                frame.presentationHint = "label";
            }
            frames.push(frame);
            if (frames.length > maxLevels) {
                break;
            }
        }
        response.body = {
            stackFrames: frames,
            totalFrames: stack.length,
        };
        this.sendResponse(response);
    }
    scopesRequest(response, args) {
        if (this.debugger) {
            this.tokens = this.debugger.tokenList;
            this.debugger.getVariables(args.frameId).then((values) => {
                this.variables = values;
                const scopes = [];
                scopes.push(new debugadapter_1.Scope("Globals", VarRef.Globals, true));
                response.body = {
                    scopes,
                };
                this.sendResponse(response);
            }).catch(() => {
                this.sendResponse(response);
            });
        }
    }
    variablesRequest(response, args) {
        const variables = [];
        switch (args.variablesReference) {
            case VarRef.Globals: {
                if (this.tokens && this.debugger) {
                    variables.push({
                        name: "Test Input",
                        type: "string",
                        value: this.testInput,
                        variablesReference: 0,
                    });
                    variables.push({
                        name: "Input Size",
                        type: "number",
                        value: this.debugger.inputSize.toString(),
                        variablesReference: 0,
                    });
                    variables.push({
                        name: "Error Count",
                        type: "number",
                        value: this.debugger.errorCount.toString(),
                        variablesReference: 0,
                    });
                    variables.push({
                        name: "Input Tokens",
                        value: (this.tokens.length - this.debugger.currentTokenIndex).toString(),
                        variablesReference: VarRef.Tokens,
                        indexedVariables: this.tokens.length - this.debugger.currentTokenIndex,
                    });
                }
                break;
            }
            case VarRef.Context: {
                break;
            }
            case VarRef.Tokens: {
                if (this.tokens) {
                    const start = this.debugger.currentTokenIndex + (args.start ? args.start : 0);
                    const length = args.count ? args.count : this.tokens.length;
                    for (let i = 0; i < length; ++i) {
                        const index = start + i;
                        variables.push({
                            name: `${index}: ${this.debugger.tokenTypeName(this.tokens[index])}`,
                            type: "Token",
                            value: "",
                            variablesReference: VarRef.Tokens + index,
                            presentationHint: { kind: "class", attributes: ["readonly"] },
                        });
                    }
                }
                break;
            }
            default: {
                if (args.variablesReference >= VarRef.Tokens && this.tokens) {
                    const tokenIndex = args.variablesReference % VarRef.Tokens;
                    if (tokenIndex >= 0 && tokenIndex < this.tokens.length) {
                        const token = this.tokens[tokenIndex];
                        variables.push({
                            name: "text",
                            type: "string",
                            value: token.text ?? "",
                            variablesReference: 0,
                        });
                        variables.push({
                            name: "type",
                            type: "number",
                            value: String(token.type),
                            variablesReference: 0,
                        });
                        variables.push({
                            name: "line",
                            type: "number",
                            value: String(token.line),
                            variablesReference: 0,
                        });
                        variables.push({
                            name: "offset",
                            type: "number",
                            value: String(token.charPositionInLine),
                            variablesReference: 0,
                        });
                        variables.push({
                            name: "channel",
                            type: "number",
                            value: String(token.channel),
                            variablesReference: 0,
                        });
                        variables.push({
                            name: "tokenIndex",
                            type: "number",
                            value: String(token.tokenIndex),
                            variablesReference: 0,
                        });
                        variables.push({
                            name: "startIndex",
                            type: "number",
                            value: String(token.startIndex),
                            variablesReference: 0,
                        });
                        variables.push({
                            name: "stopIndex",
                            type: "number",
                            value: String(token.stopIndex),
                            variablesReference: 0,
                        });
                    }
                }
                break;
            }
        }
        response.body = {
            variables,
        };
        this.sendResponse(response);
    }
    pauseRequest(response, _args) {
        this.debugger?.pause();
        this.sendResponse(response);
    }
    continueRequest(response) {
        this.debugger?.continue();
        this.sendResponse(response);
    }
    nextRequest(response) {
        this.debugger?.stepOver();
        this.sendResponse(response);
    }
    stepInRequest(response) {
        this.debugger?.stepIn();
        this.sendResponse(response);
    }
    stepOutRequest(response) {
        this.debugger?.stepOut();
        this.sendResponse(response);
    }
    evaluateRequest(response) {
        response.body = {
            result: "evaluation not supported",
            variablesReference: 0,
        };
        this.sendResponse(response);
    }
    setup(grammar, actionFile) {
        const basePath = path.dirname(grammar);
        this.debugger = this.backend.createDebugger(grammar, actionFile, path.join(basePath, ".antlr"));
        if (!this.debugger) {
            throw Error("Debugger creation failed. There are grammar errors.");
        }
        if (!this.debugger.isValid) {
            throw Error("Debugger creation failed. You are either trying to debug an unsupported file type or " +
                "no interpreter data has been generated yet for the given grammar.");
        }
        this.debugger.on("stopOnStep", () => {
            this.notifyConsumers(vscode_1.Uri.file(grammar));
            this.sendEvent(new debugadapter_1.StoppedEvent("step", AntlrDebugSession.threadId));
        });
        this.debugger.on("stopOnPause", () => {
            this.notifyConsumers(vscode_1.Uri.file(grammar));
            this.sendEvent(new debugadapter_1.StoppedEvent("pause", AntlrDebugSession.threadId));
        });
        this.debugger.on("stopOnBreakpoint", () => {
            this.notifyConsumers(vscode_1.Uri.file(grammar));
            this.sendEvent(new debugadapter_1.StoppedEvent("breakpoint", AntlrDebugSession.threadId));
        });
        this.debugger.on("stopOnException", () => {
            this.notifyConsumers(vscode_1.Uri.file(grammar));
            this.sendEvent(new debugadapter_1.StoppedEvent("exception", AntlrDebugSession.threadId));
        });
        this.debugger.on("breakpointValidated", (bp) => {
            const breakpoint = {
                verified: bp.validated,
                id: bp.id,
            };
            this.sendEvent(new debugadapter_1.BreakpointEvent("changed", breakpoint));
        });
        this.debugger.on("output", (...args) => {
            const isError = args[4];
            const column = args[3];
            const line = args[2];
            const filePath = args[1];
            const text = args[0];
            const e = new debugadapter_1.OutputEvent(`${text}\n`);
            e.body.source = filePath ? this.createSource(filePath) : undefined;
            e.body.line = line;
            e.body.column = column;
            e.body.category = isError ? "stderr" : "stdout";
            this.sendEvent(e);
        });
        this.debugger.on("end", () => {
            this.notifyConsumers(vscode_1.Uri.file(grammar));
            if (this.showTextualParseTree) {
                let text = "";
                if (!this.tokens) {
                    this.tokens = this.debugger?.tokenList;
                }
                const recognizer = this.debugger?.recognizer;
                this.tokens?.forEach((token) => {
                    text += token.toString(recognizer) + "\n";
                });
                this.sendEvent(new debugadapter_1.OutputEvent("Tokens:\n" + text + "\n"));
                const tree = this.debugger?.currentParseTree;
                if (tree) {
                    const treeText = this.parseNodeToString(tree);
                    this.sendEvent(new debugadapter_1.OutputEvent("Parse Tree:\n" + treeText + "\n"));
                }
                else {
                    this.sendEvent(new debugadapter_1.OutputEvent("No Parse Tree\n"));
                }
            }
            if (this.showGraphicalParseTree) {
                this.parseTreeProvider?.showWebview(vscode_1.Uri.file(grammar), {
                    title: "Parse Tree: " + path.basename(grammar),
                });
            }
            this.sendEvent(new debugadapter_1.TerminatedEvent());
        });
        this.debugger.on("error", (reason) => {
            const e = new debugadapter_1.OutputEvent(`${reason}\n`);
            e.body.category = "stderr";
            this.sendEvent(e);
        });
    }
    createSource(filePath) {
        return new debugadapter_1.Source(path.basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, "antlr-data");
    }
    parseNodeToString(node, level = 0) {
        let result = " ".repeat(level);
        switch (node.type) {
            case "rule": {
                const name = this.debugger.ruleNameFromIndex(node.ruleIndex);
                result += name ? name : "<unknown rule>";
                if (node.children.length > 0) {
                    result += " (\n";
                    for (const child of node.children) {
                        result += this.parseNodeToString(child, level + 1);
                    }
                    result += " ".repeat(level) + ")\n";
                }
                break;
            }
            case "error": {
                result += " <Error>";
                if (node.symbol) {
                    result += "\"" + node.symbol.text + "\"\n";
                }
                break;
            }
            case "terminal": {
                result += "\"" + node.symbol.text + "\"\n";
                break;
            }
            default:
        }
        return result;
    }
    notifyConsumers(uri) {
        for (const consumer of this.consumers) {
            consumer.debuggerStopped(uri);
        }
    }
    escapeText(input) {
        let result = "";
        for (const c of input) {
            switch (c) {
                case "\n": {
                    result += "\\n";
                    break;
                }
                case "\r": {
                    result += "\\r";
                    break;
                }
                case "\t": {
                    result += "\\t";
                    break;
                }
                default: {
                    result += c;
                    break;
                }
            }
        }
        return result;
    }
}
exports.AntlrDebugSession = AntlrDebugSession;
//# sourceMappingURL=AntlrDebugAdapter.js.map
import { DebugSession } from "@vscode/debugadapter";
import { DebugProtocol } from "@vscode/debugprotocol";
import { Uri, WorkspaceFolder } from "vscode";
import { GrammarDebugger } from "../backend/GrammarDebugger";
import { AntlrFacade } from "../backend/facade";
export interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    input: string;
    startRule: string;
    grammar: string;
    actionFile: string;
    stopOnEntry?: boolean;
    trace?: boolean;
    printParseTree?: boolean;
    visualParseTree?: boolean;
}
export interface IDebuggerConsumer {
    debugger: GrammarDebugger;
    updateContent(uri: Uri): void;
    debuggerStopped(uri: Uri): void;
}
export declare class AntlrDebugSession extends DebugSession {
    private folder;
    private backend;
    private consumers;
    private static threadId;
    private debugger;
    private parseTreeProvider?;
    private configurationDone;
    private showTextualParseTree;
    private showGraphicalParseTree;
    private testInput;
    private tokens;
    private variables;
    constructor(folder: WorkspaceFolder | undefined, backend: AntlrFacade, consumers: IDebuggerConsumer[]);
    shutdown(): void;
    protected initializeRequest(response: DebugProtocol.InitializeResponse, _args: DebugProtocol.InitializeRequestArguments): void;
    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void;
    protected launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments): void;
    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void;
    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void;
    protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void;
    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void;
    protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments): void;
    protected pauseRequest(response: DebugProtocol.PauseResponse, _args: DebugProtocol.PauseArguments): void;
    protected continueRequest(response: DebugProtocol.ContinueResponse): void;
    protected nextRequest(response: DebugProtocol.NextResponse): void;
    protected stepInRequest(response: DebugProtocol.StepInResponse): void;
    protected stepOutRequest(response: DebugProtocol.StepOutResponse): void;
    protected evaluateRequest(response: DebugProtocol.EvaluateResponse): void;
    private setup;
    private createSource;
    private parseNodeToString;
    private notifyConsumers;
    private escapeText;
}

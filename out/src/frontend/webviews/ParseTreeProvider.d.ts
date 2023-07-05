import { Uri, Webview } from "vscode";
import { WebviewProvider, IWebviewShowOptions } from "./WebviewProvider";
import { IDebuggerConsumer } from "../AntlrDebugAdapter";
import { GrammarDebugger } from "../../backend/GrammarDebugger";
export declare class ParseTreeProvider extends WebviewProvider implements IDebuggerConsumer {
    debugger: GrammarDebugger;
    debuggerStopped(uri: Uri): void;
    generateContent(webview: Webview, uri: Uri, _options: IWebviewShowOptions): string;
    updateContent(uri: Uri): boolean;
}

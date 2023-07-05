import { TextEditor, ExtensionContext, Uri, Webview } from "vscode";
import { AntlrFacade } from "../../backend/facade";
export interface IWebviewShowOptions {
    [key: string]: boolean | number | string;
    title: string;
}
export interface IWebviewMessage {
    [key: string]: unknown;
}
export declare class WebviewProvider {
    protected backend: AntlrFacade;
    protected context: ExtensionContext;
    protected currentRule: string | undefined;
    protected currentRuleIndex: number | undefined;
    private webViewMap;
    constructor(backend: AntlrFacade, context: ExtensionContext);
    showWebview(uri: Uri, options: IWebviewShowOptions): void;
    update(editor: TextEditor): void;
    protected generateContent(_webview: Webview, _source: Uri, _options: IWebviewShowOptions): string;
    protected generateContentSecurityPolicy(webview: Webview, nonce: string): string;
    protected updateContent(_uri: Uri): boolean;
    protected sendMessage(uri: Uri, args: IWebviewMessage): boolean;
    protected handleMessage(_message: IWebviewMessage): boolean;
    protected getStyles(webView: Webview): string;
    protected getScripts(nonce: string, scripts: string[]): string;
    protected generateNonce(): string;
}

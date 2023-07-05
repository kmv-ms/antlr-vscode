import { TextEditor, Uri, Webview } from "vscode";
import { WebviewProvider, IWebviewShowOptions } from "./WebviewProvider";
export declare class RailroadDiagramProvider extends WebviewProvider {
    generateContent(webview: Webview, uri: Uri, options: IWebviewShowOptions): string;
    update(editor: TextEditor, forced?: boolean): void;
}

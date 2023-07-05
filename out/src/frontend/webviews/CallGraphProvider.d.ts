import { Uri, Webview } from "vscode";
import { WebviewProvider } from "./WebviewProvider";
export declare class CallGraphProvider extends WebviewProvider {
    generateContent(webview: Webview, uri: Uri): string;
}

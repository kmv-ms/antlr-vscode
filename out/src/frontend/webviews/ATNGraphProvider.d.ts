import { WebviewProvider, IWebviewMessage } from "./WebviewProvider";
import { Uri, TextEditor, Webview } from "vscode";
interface IATNStatePosition {
    fx?: number;
    fy?: number;
}
interface IATNStateEntry {
    scale: number;
    translation: {
        x: number | undefined;
        y: number | undefined;
    };
    statePositions: {
        [key: number]: IATNStatePosition;
    };
}
interface IATNStateMap {
    [key: string]: IATNStateEntry;
}
interface IATNFileStateMap {
    [key: string]: IATNStateMap;
}
export declare class ATNGraphProvider extends WebviewProvider {
    static cachedATNTransformations: IATNFileStateMap;
    static addStatesForGrammar(root: string, grammar: string): void;
    generateContent(webview: Webview, uri: Uri): string;
    update(editor: TextEditor, forced?: boolean): void;
    protected handleMessage(message: IWebviewMessage): boolean;
    protected updateContent(uri: Uri): boolean;
    private prepareRenderData;
}
export {};

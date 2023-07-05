import { ExtensionContext, Webview, ProviderResult, TextDocument } from "vscode";
import { AntlrFacade } from "../backend/facade";
import { ILexicalRange } from "../backend/types";
export interface IRangeHolder {
    range?: ILexicalRange;
}
export declare class FrontendUtils {
    static getMiscPath(file: string, context: ExtensionContext, webview?: Webview): string;
    static getOutPath(file: string, context: ExtensionContext, webview?: Webview): string;
    static getNodeModulesPath(webview: Webview, file: string, context: ExtensionContext): string;
    static isAbsolute(p: string): boolean;
    static deleteFolderRecursive(target: string): void;
    static hashForPath(dataPath: string): string;
    static copyFilesIfNewer(files: string[], targetPath: string): void;
    static exportDataWithConfirmation(fileName: string, filters: {
        [name: string]: string[];
    }, data: string, extraFiles: string[]): void;
    static findInListFromPosition<T extends IRangeHolder>(list: T[], column: number, row: number): T | undefined;
    static switchVsCodeContext(key: string, enable: boolean): ProviderResult<unknown>;
    static isGrammarFile(document?: TextDocument | undefined): boolean;
    static updateVsCodeContext(backend: AntlrFacade, document: TextDocument | undefined): void;
}

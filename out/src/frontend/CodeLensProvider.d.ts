import { CodeLensProvider, TextDocument, CancellationToken, CodeLens, Event, ProviderResult } from "vscode";
import { AntlrFacade } from "../backend/facade";
export declare class AntlrCodeLensProvider implements CodeLensProvider {
    private backend;
    private changeEvent;
    private documentName;
    constructor(backend: AntlrFacade);
    get onDidChangeCodeLenses(): Event<void>;
    refresh(): void;
    provideCodeLenses(document: TextDocument, _token: CancellationToken): ProviderResult<CodeLens[]>;
    resolveCodeLens(codeLens: CodeLens, _token: CancellationToken): ProviderResult<CodeLens>;
}

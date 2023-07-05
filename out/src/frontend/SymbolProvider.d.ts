import { TextDocument, CancellationToken, SymbolInformation, DocumentSymbolProvider, ProviderResult } from "vscode";
import { AntlrFacade } from "../backend/facade";
export declare class AntlrSymbolProvider implements DocumentSymbolProvider {
    private backend;
    constructor(backend: AntlrFacade);
    provideDocumentSymbols(document: TextDocument, _cancel: CancellationToken): ProviderResult<SymbolInformation[]>;
}

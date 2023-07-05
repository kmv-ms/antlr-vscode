import { TextDocument, Position, CancellationToken, ProviderResult, CompletionList } from "vscode";
import { AntlrFacade } from "../backend/facade";
export declare class AntlrCompletionItemProvider {
    private backend;
    constructor(backend: AntlrFacade);
    provideCompletionItems(document: TextDocument, position: Position, _token: CancellationToken): ProviderResult<CompletionList>;
}

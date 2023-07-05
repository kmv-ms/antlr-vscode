import { TextDocument, Position, CancellationToken, ProviderResult, WorkspaceEdit, RenameProvider } from "vscode";
import { AntlrFacade } from "../backend/facade";
export declare class AntlrRenameProvider implements RenameProvider {
    private backend;
    constructor(backend: AntlrFacade);
    provideRenameEdits(document: TextDocument, position: Position, newName: string, _token: CancellationToken): ProviderResult<WorkspaceEdit>;
}

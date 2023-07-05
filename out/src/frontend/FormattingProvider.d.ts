import { AntlrFacade } from "../backend/facade";
import { DocumentRangeFormattingEditProvider, TextDocument, FormattingOptions, CancellationToken, ProviderResult, TextEdit, Range } from "vscode";
export declare class AntlrFormattingProvider implements DocumentRangeFormattingEditProvider {
    private backend;
    constructor(backend: AntlrFacade);
    provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, _options: FormattingOptions, _token: CancellationToken): ProviderResult<TextEdit[]>;
}

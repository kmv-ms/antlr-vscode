import { TreeItem, Command, TextEditor, TreeView, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";
import { ILexicalRange, CodeActionType } from "../backend/types";
import { IRangeHolder } from "./FrontendUtils";
export declare class RootEntry extends TreeItem {
    contextValue: string;
    constructor(label: string, id: string);
}
export declare class ChildEntry extends TreeItem implements IRangeHolder {
    readonly parent: RootEntry;
    readonly range?: ILexicalRange | undefined;
    private static imageBaseNames;
    contextValue: string;
    constructor(parent: RootEntry, label: string, type: CodeActionType, range?: ILexicalRange | undefined, command?: Command);
}
export declare class ActionsProvider extends AntlrTreeDataProvider<TreeItem> {
    actionTree: TreeView<TreeItem>;
    private globalNamedActionsRoot;
    private localNamedActionsRoot;
    private parserActionsRoot;
    private lexerActionsRoot;
    private parserPredicatesRoot;
    private lexerPredicatesRoot;
    private globalNamedActions;
    private localNamedActions;
    private parserActions;
    private lexerActions;
    private parserPredicates;
    private lexerPredicates;
    update(editor: TextEditor): void;
    getParent?(element: TreeItem): ProviderResult<TreeItem>;
    getChildren(element?: TreeItem): ProviderResult<TreeItem[]>;
    private createRootEntries;
}

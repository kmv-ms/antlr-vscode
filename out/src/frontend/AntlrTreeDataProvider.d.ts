import { TreeDataProvider, TreeItem, TextDocument, ProviderResult, Event } from "vscode";
import { AntlrFacade } from "../backend/facade";
export declare class AntlrTreeDataProvider<T extends TreeItem> implements TreeDataProvider<T> {
    protected backend: AntlrFacade;
    protected currentFile: string | undefined;
    private changeEvent;
    constructor(backend: AntlrFacade);
    get onDidChangeTreeData(): Event<void>;
    refresh(document: TextDocument | undefined): void;
    getTreeItem(element: T): TreeItem;
    getChildren(_element?: T): ProviderResult<T[]>;
}

import { TreeItem, TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";
export declare class Import extends TreeItem {
    readonly label: string;
    readonly collapsibleState: TreeItemCollapsibleState;
    iconPath: {
        light: string;
        dark: string;
    };
    contextValue: string;
    constructor(label: string, collapsibleState: TreeItemCollapsibleState, command?: Command);
}
export declare class ImportsProvider extends AntlrTreeDataProvider<Import> {
    getChildren(element?: Import): ProviderResult<Import[]>;
}

import { IParseTreeNode } from "./types";
export interface IRendererData {
    parseTreeData: IParseTreeNode;
    useCluster: boolean;
    horizontal: boolean;
    initialScale: number;
    initialTranslateX: number;
    initialTranslateY: number;
}
export declare class ParseTreeRenderer {
    private readonly duration;
    private readonly width;
    private readonly height;
    private nodeSizeFactor;
    private nodeWidth;
    private nodeHeight;
    private rectW;
    private rectH;
    private root?;
    private svg;
    private topGroup;
    private zoom;
    private cluster;
    private tree;
    private nodeSelection;
    private linkSelection;
    private data?;
    constructor();
    get transform(): string;
    loadNewTree(data: Partial<IRendererData> & {
        parseTreeData: IParseTreeNode;
    }): void;
    changeNodeSize(factor: number): void;
    toggleOrientation(checkbox: HTMLInputElement): void;
    toggleTreeType(checkbox: HTMLInputElement): void;
    initSwitches(): void;
    private update;
    private updateLayouts;
    private applyLayoutChanges;
    private updateExistingNodes;
    private click;
    private createText;
    private computeLinks;
}

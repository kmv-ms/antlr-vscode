import { ICallGraphEntry } from "./types";
export declare class CallGraphRenderer {
    private data;
    private readonly initialDiameter;
    private diameter;
    private initialScale;
    private svg;
    private topGroup;
    private cluster;
    private nodeSelection;
    private linkSelection;
    constructor(data: ICallGraphEntry[]);
    render(): void;
    changeDiameter(factor: number): void;
    private onMouseOver;
    private onMouseOut;
    private packageHierarchy;
    private packageReferences;
}

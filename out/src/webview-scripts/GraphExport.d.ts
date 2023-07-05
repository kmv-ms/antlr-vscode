import { IVSCode } from "./types";
export declare const vscode: IVSCode;
export type GraphType = "rrd" | "atn" | "call-graph";
export declare class GraphExport {
    exportToSVG(type: GraphType, name: string): void;
    exportToHTML(type: GraphType, name: string): void;
}

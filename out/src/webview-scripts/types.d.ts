import { ATNStateType, TransitionType } from "antlr4ts/atn";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import { Uri } from "vscode";
export interface IWebviewMessage {
    [key: string]: unknown;
}
export interface IVSCode {
    postMessage(message: IWebviewMessage): void;
    getState(): unknown;
    setState(state: unknown): void;
}
export interface ILexicalRange {
    start: {
        column: number;
        row: number;
    };
    end: {
        column: number;
        row: number;
    };
}
export interface IDefinition {
    text: string;
    range: ILexicalRange;
}
export interface ILexerToken {
    [key: string]: string | number | object;
    text: string;
    type: number;
    name: string;
    line: number;
    offset: number;
    channel: number;
    tokenIndex: number;
    startIndex: number;
    stopIndex: number;
}
export interface IIndexRange {
    startIndex: number;
    stopIndex: number;
    length: number;
}
export interface IParseTreeNode {
    type: "rule" | "terminal" | "error";
    id: number;
    ruleIndex?: number;
    name: string;
    start?: ILexerToken;
    stop?: ILexerToken;
    range?: IIndexRange;
    symbol?: ILexerToken;
    children: IParseTreeNode[];
}
export interface IATNGraphRendererData {
    uri: Uri;
    ruleName?: string;
    maxLabelCount: number;
    graphData?: IATNGraphData;
    initialScale: number;
    initialTranslation: {
        x?: number;
        y?: number;
    };
}
export interface IATNGraphUpdateMessageData {
    command: "updateATNTreeData";
    graphData: IATNGraphRendererData;
}
export interface IATNStateSaveMessage extends IWebviewMessage {
    command: "saveATNState";
    nodes: IATNGraphLayoutNode[];
    uri: Uri;
    rule: string;
    transform: d3.ZoomTransform;
}
export interface IATNNode {
    id: number;
    name: string;
    type: ATNStateType;
}
export interface IATNLink {
    source: number;
    target: number;
    type: TransitionType;
    labels: Array<{
        content: string;
        class?: string;
    }>;
}
export interface IATNGraphData {
    nodes: IATNNode[];
    links: IATNLink[];
}
export interface IATNGraphLayoutNode extends SimulationNodeDatum, IATNNode {
    width?: number;
    endX?: number;
    endY?: number;
}
export interface IATNGraphLayoutLink extends SimulationLinkDatum<IATNGraphLayoutNode> {
    type: TransitionType;
    labels: Array<{
        content: string;
        class?: string;
    }>;
}
export interface ICallGraphEntry {
    name: string;
    references: string[];
}

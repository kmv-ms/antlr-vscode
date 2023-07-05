import * as vscode from "vscode";
import { SymbolKind } from "../backend/types";
export declare const symbolDescriptionFromEnum: (kind: SymbolKind) => string;
export declare const translateSymbolKind: (kind: SymbolKind) => vscode.SymbolKind;
export declare const translateCompletionKind: (kind: SymbolKind) => vscode.CompletionItemKind;

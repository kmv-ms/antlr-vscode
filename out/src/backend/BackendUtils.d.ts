import { ParseTree } from "antlr4ts/tree";
export declare class BackendUtils {
    static parseTreeFromPosition: (root: ParseTree, column: number, row: number) => ParseTree | undefined;
}

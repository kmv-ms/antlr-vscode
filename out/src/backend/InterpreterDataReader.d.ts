import { ATN } from "antlr4ts/atn";
import { Vocabulary } from "antlr4ts";
export interface IInterpreterData {
    atn: ATN;
    vocabulary: Vocabulary;
    ruleNames: string[];
    channels: string[];
    modes: string[];
}
export declare class InterpreterDataReader {
    static parseFile(fileName: string): IInterpreterData;
}

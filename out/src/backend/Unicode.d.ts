import { IntervalSet } from "antlr4ts/misc";
export declare const fullUnicodeSet: IntervalSet;
export interface IUnicodeOptions {
    excludeCJK?: boolean;
    excludeRTL?: boolean;
    limitToBMP?: boolean;
    includeLineTerminators?: boolean;
}
export declare const printableUnicodePoints: (options: IUnicodeOptions) => Promise<IntervalSet>;
export declare const randomCodeBlocks: (blockOverrides?: Map<string, number>) => IntervalSet;

import { ANTLRv4ParserListener } from "../parser/ANTLRv4ParserListener";
import { LexerRuleSpecContext, ParserRuleSpecContext, TokensSpecContext, ChannelsSpecContext, ModeSpecContext, DelegateGrammarContext, TerminalRuleContext, RulerefContext, BlockContext, AlternativeContext, RuleBlockContext, EbnfSuffixContext, OptionsSpecContext, ActionBlockContext, ArgActionBlockContext, LabeledElementContext, LexerRuleBlockContext, LexerAltContext, LexerCommandContext, OptionContext } from "../parser/ANTLRv4Parser";
import { ContextSymbolTable } from "./ContextSymbolTable";
import { TerminalNode } from "antlr4ts/tree";
export declare class DetailsListener implements ANTLRv4ParserListener {
    private symbolTable;
    private imports;
    private symbolStack;
    constructor(symbolTable: ContextSymbolTable, imports: string[]);
    private get ruleName();
    enterParserRuleSpec(ctx: ParserRuleSpecContext): void;
    exitParserRuleSpec(_ctx: ParserRuleSpecContext): void;
    enterRuleBlock(ctx: RuleBlockContext): void;
    exitRuleBlock(): void;
    enterLexerRuleSpec(ctx: LexerRuleSpecContext): void;
    exitLexerRuleSpec(): void;
    enterLexerRuleBlock(ctx: LexerRuleBlockContext): void;
    exitLexerRuleBlock(_ctx: LexerRuleBlockContext): void;
    enterBlock(ctx: BlockContext): void;
    exitBlock(_ctx: BlockContext): void;
    enterAlternative(ctx: AlternativeContext): void;
    exitAlternative(_ctx: AlternativeContext): void;
    enterLexerAlt(ctx: LexerAltContext): void;
    exitLexerAlt(_ctx: LexerAltContext): void;
    exitTokensSpec(ctx: TokensSpecContext): void;
    exitChannelsSpec(ctx: ChannelsSpecContext): void;
    exitTerminalRule(ctx: TerminalRuleContext): void;
    exitRuleref(ctx: RulerefContext): void;
    exitModeSpec(ctx: ModeSpecContext): void;
    exitDelegateGrammar(ctx: DelegateGrammarContext): void;
    enterOptionsSpec(ctx: OptionsSpecContext): void;
    exitOptionsSpec(_ctx: OptionsSpecContext): void;
    exitOption(ctx: OptionContext): void;
    exitActionBlock(ctx: ActionBlockContext): void;
    exitArgActionBlock(ctx: ArgActionBlockContext): void;
    exitEbnfSuffix(ctx: EbnfSuffixContext): void;
    enterLexerCommand(ctx: LexerCommandContext): void;
    exitLexerCommand(_ctx: LexerCommandContext): void;
    exitLabeledElement(ctx: LabeledElementContext): void;
    visitTerminal: (node: TerminalNode) => void;
    private currentSymbol;
    private addNewSymbol;
    private pushNewSymbol;
    private popSymbol;
}
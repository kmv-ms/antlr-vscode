"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexerAdaptor = void 0;
const antlr4ts_1 = require("antlr4ts");
const misc_1 = require("antlr4ts/misc");
const ANTLRv4Lexer_1 = require("./ANTLRv4Lexer");
class LexerAdaptor extends antlr4ts_1.Lexer {
    currentRuleType = antlr4ts_1.Token.INVALID_TYPE;
    emit() {
        if (this.type === ANTLRv4Lexer_1.ANTLRv4Lexer.ID) {
            const firstChar = this.inputStream.getText(new misc_1.Interval(this._tokenStartCharIndex, this._tokenStartCharIndex));
            if (firstChar.charAt(0) === firstChar.charAt(0).toUpperCase()) {
                this.type = ANTLRv4Lexer_1.ANTLRv4Lexer.TOKEN_REF;
            }
            else {
                this.type = ANTLRv4Lexer_1.ANTLRv4Lexer.RULE_REF;
            }
            if (this.currentRuleType === antlr4ts_1.Token.INVALID_TYPE) {
                this.currentRuleType = this.type;
            }
        }
        else if (this.type === ANTLRv4Lexer_1.ANTLRv4Lexer.SEMI) {
            this.currentRuleType = antlr4ts_1.Token.INVALID_TYPE;
        }
        return super.emit();
    }
    handleBeginArgument() {
        if (this.currentRuleType === ANTLRv4Lexer_1.ANTLRv4Lexer.TOKEN_REF) {
            this.pushMode(ANTLRv4Lexer_1.ANTLRv4Lexer.LexerCharSet);
            this.more();
        }
        else {
            this.pushMode(ANTLRv4Lexer_1.ANTLRv4Lexer.Argument);
        }
    }
    handleEndArgument() {
        this.popMode();
        if (this._modeStack.size > 0) {
            this.type = ANTLRv4Lexer_1.ANTLRv4Lexer.ARGUMENT_CONTENT;
        }
    }
    handleEndAction() {
        this.popMode();
        if (this._modeStack.size > 0) {
            this.type = ANTLRv4Lexer_1.ANTLRv4Lexer.ACTION_CONTENT;
        }
    }
}
exports.LexerAdaptor = LexerAdaptor;
//# sourceMappingURL=LexerAdaptor.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextErrorListener = void 0;
const Decorators_1 = require("antlr4ts/Decorators");
const types_1 = require("./types");
class ContextErrorListener {
    errorList;
    constructor(errorList) {
        this.errorList = errorList;
    }
    syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, _e) {
        const error = {
            type: types_1.DiagnosticType.Error,
            message: msg,
            range: {
                start: {
                    column: charPositionInLine,
                    row: line,
                },
                end: {
                    column: charPositionInLine + 1,
                    row: line,
                },
            },
        };
        if (offendingSymbol) {
            error.range.end.column = charPositionInLine + offendingSymbol.stopIndex - offendingSymbol.startIndex + 1;
        }
        this.errorList.push(error);
    }
}
__decorate([
    Decorators_1.Override
], ContextErrorListener.prototype, "syntaxError", null);
exports.ContextErrorListener = ContextErrorListener;
//# sourceMappingURL=ContextErrorListener.js.map
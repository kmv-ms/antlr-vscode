"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentenceGenerator = void 0;
const vm = __importStar(require("vm"));
const fs = __importStar(require("fs"));
const atn_1 = require("antlr4ts/atn");
const misc_1 = require("antlr4ts/misc");
const Unicode_1 = require("./Unicode");
const ContextSymbolTable_1 = require("./ContextSymbolTable");
class SentenceGenerator {
    lexerData;
    parserData;
    static printableUnicode;
    runPredicate;
    lexerPredicates;
    parserPredicates;
    convergenceFactor;
    lexerDecisionCounts;
    parserDecisionCounts;
    minParserIterations;
    maxParserIterations;
    minLexerIterations;
    maxLexerIterations;
    maxRecursions;
    maxRecursionLabel;
    ruleInvocations = new Map();
    ruleMappings;
    parserStack = [];
    constructor(context, lexerData, parserData, actionFile) {
        this.lexerData = lexerData;
        this.parserData = parserData;
        this.lexerPredicates = context.symbolTable.getNestedSymbolsOfTypeSync(ContextSymbolTable_1.LexerPredicateSymbol);
        this.parserPredicates = context.symbolTable.getNestedSymbolsOfTypeSync(ContextSymbolTable_1.ParserPredicateSymbol);
        if (actionFile) {
            const code = fs.readFileSync(actionFile, { encoding: "utf-8" }) + `
            const runPredicate = (predicate) => eval(predicate);
            runPredicate;
            `;
            this.runPredicate = vm.runInNewContext(code);
        }
    }
    generate(options, start) {
        this.convergenceFactor = options.convergenceFactor ?? 0.25;
        this.minParserIterations = options.minParserIterations ?? 0;
        if (this.minParserIterations < 0) {
            this.minParserIterations = 0;
        }
        else {
            this.minParserIterations = Math.floor(this.minParserIterations);
        }
        this.maxParserIterations = options.maxParserIterations ?? this.minParserIterations + 1;
        if (this.maxParserIterations < this.minParserIterations) {
            this.maxParserIterations = this.minParserIterations + 1;
        }
        else {
            this.maxParserIterations = Math.ceil(this.maxParserIterations);
        }
        this.minLexerIterations = options.minLexerIterations ?? 0;
        if (this.minLexerIterations < 0) {
            this.minLexerIterations = 0;
        }
        else {
            this.minLexerIterations = Math.floor(this.minLexerIterations);
        }
        this.maxLexerIterations = options.maxLexerIterations ?? this.minLexerIterations + 10;
        if (this.maxLexerIterations < this.minLexerIterations) {
            this.maxLexerIterations = this.minLexerIterations + 10;
        }
        else {
            this.maxLexerIterations = Math.ceil(this.maxLexerIterations);
        }
        this.maxRecursions = (!options.maxRecursions || options.maxRecursions < 1) ? 3 : options.maxRecursions;
        this.maxRecursionLabel = options.maxRecursionLabel ?? "⨱";
        this.ruleInvocations.clear();
        this.ruleMappings = options.ruleMappings;
        this.lexerDecisionCounts = new Map();
        this.parserDecisionCounts = new Map();
        this.parserStack.length = 0;
        const [result] = this.generateFromATNSequence(start, start.stopState, start.atn === this.lexerData.atn);
        return result;
    }
    sempred(ruleIndex, predIndex, inLexer) {
        if (this.runPredicate) {
            let predicate = "";
            if (inLexer) {
                if (predIndex < this.lexerPredicates.length) {
                    predicate = this.lexerPredicates[predIndex].context.text;
                }
            }
            else {
                if (predIndex < this.parserPredicates.length) {
                    predicate = this.parserPredicates[predIndex].context.text;
                }
            }
            if (predicate.length > 2) {
                predicate = predicate.substring(1, predicate.length - 1);
                try {
                    return this.runPredicate(predicate);
                }
                catch (e) {
                    throw Error(`There was an error while evaluating predicate "${predicate}". ` +
                        `Evaluation returned: ` + String(e));
                }
            }
        }
        return true;
    }
    getRuleName(inLexer, index) {
        if (inLexer) {
            return this.lexerData.ruleNames[index];
        }
        if (this.parserData) {
            return this.parserData.ruleNames[index];
        }
        return undefined;
    }
    invokeRule(name) {
        const count = this.ruleInvocations.get(name);
        if (count) {
            if (count < this.maxRecursions) {
                this.ruleInvocations.set(name, count + 1);
                return true;
            }
            return false;
        }
        this.ruleInvocations.set(name, 1);
        return true;
    }
    leaveRule(name) {
        let count = this.ruleInvocations.get(name);
        if (count) {
            --count;
            if (count === 0) {
                this.ruleInvocations.delete(name);
            }
            else {
                this.ruleInvocations.set(name, count);
            }
        }
    }
    generateFromATNSequence(start, stop, addSpace) {
        const inLexer = start.atn === this.lexerData.atn;
        const isRule = start.stateType === atn_1.ATNStateType.RULE_START;
        let ruleName;
        if (isRule) {
            ruleName = this.getRuleName(inLexer, start.ruleIndex);
            if (!ruleName) {
                return ["", false];
            }
            const mappingValue = this.ruleMappings?.[ruleName];
            if (mappingValue) {
                let mapping;
                if (Array.isArray(mappingValue)) {
                    if (mappingValue.length === 1) {
                        mapping = mappingValue[0];
                    }
                    else if (mappingValue.length > 0) {
                        const randomIndex = Math.floor(Math.random() * mappingValue.length);
                        const randomElement = mappingValue[randomIndex];
                        mapping = randomElement;
                    }
                }
                else {
                    mapping = mappingValue;
                }
                if (mapping) {
                    return [addSpace ? mapping + " " : mapping, false];
                }
            }
            if (!this.invokeRule(ruleName)) {
                return [addSpace ? this.maxRecursionLabel + " " : this.maxRecursionLabel, false];
            }
        }
        let result = "";
        let blockedByPredicate = false;
        let run = start;
        while (run !== stop) {
            switch (run.stateType) {
                case atn_1.ATNStateType.BLOCK_START: {
                    result += this.generateFromDecisionState(run, !inLexer);
                    run = run.endState;
                    break;
                }
                case atn_1.ATNStateType.PLUS_BLOCK_START: {
                    const loopBack = run.loopBackState;
                    const count = this.getRandomLoopCount(inLexer, true);
                    for (let i = 0; i < count; ++i) {
                        result += this.generateFromDecisionState(run, !inLexer);
                    }
                    run = loopBack.transition(1).target;
                    break;
                }
                case atn_1.ATNStateType.STAR_LOOP_ENTRY: {
                    const slEntry = run;
                    const blockStart = this.blockStart(slEntry);
                    if (blockStart) {
                        const count = this.getRandomLoopCount(inLexer, false);
                        for (let i = 0; i < count; ++i) {
                            result += this.generateFromDecisionState(blockStart, !inLexer);
                        }
                    }
                    run = this.loopEnd(slEntry) || stop;
                    break;
                }
                default: {
                    const transition = run.transition(0);
                    switch (transition.serializationType) {
                        case 3: {
                            run = transition.followState;
                            const ruleStart = transition.target;
                            const [text] = this.generateFromATNSequence(ruleStart, ruleStart.stopState, !inLexer);
                            result += text;
                            break;
                        }
                        case 9: {
                            let text = "";
                            if (inLexer) {
                                [text] = this.getRandomCharacterFromInterval(Unicode_1.fullUnicodeSet);
                            }
                            else {
                                const ruleIndex = Math.floor(Math.random() *
                                    this.lexerData.atn.ruleToStartState.length);
                                const state = this.lexerData.atn.ruleToStartState[ruleIndex];
                                [text] = this.generateFromATNSequence(state, state.stopState, !inLexer);
                            }
                            result += text;
                            run = transition.target;
                            break;
                        }
                        case 4: {
                            const predicateTransition = transition;
                            blockedByPredicate = !this.sempred(run.ruleIndex, predicateTransition.predIndex, inLexer);
                            run = blockedByPredicate ? stop : transition.target;
                            break;
                        }
                        default: {
                            if (inLexer) {
                                if (transition.label && transition.label.minElement > -1) {
                                    let label = transition.label;
                                    if (transition instanceof atn_1.NotSetTransition) {
                                        label = label.complement(misc_1.IntervalSet.COMPLETE_CHAR_SET);
                                    }
                                    result += this.getRandomCharacterFromInterval(label);
                                }
                            }
                            else {
                                if (transition.label && transition.label.maxElement > -1) {
                                    const randomIndex = Math.floor(Math.random() * transition.label.size);
                                    const token = this.getIntervalElement(transition.label, randomIndex);
                                    const tokenIndex = this.lexerData.atn.ruleToTokenType.indexOf(token);
                                    if (tokenIndex === -1) {
                                        const tokenName = this.lexerData.vocabulary.getSymbolicName(token);
                                        if (tokenName) {
                                            const mappingValue = this.ruleMappings?.[tokenName];
                                            let mapping;
                                            if (mappingValue) {
                                                if (Array.isArray(mappingValue)) {
                                                    if (mappingValue.length === 1) {
                                                        mapping = mappingValue[0];
                                                    }
                                                    else if (mappingValue.length > 0) {
                                                        const randomIndex = Math.floor(Math.random() *
                                                            mappingValue.length);
                                                        mapping = mappingValue[randomIndex];
                                                    }
                                                }
                                                else if (mappingValue) {
                                                    mapping = mappingValue;
                                                }
                                            }
                                            if (mapping) {
                                                result += addSpace ? mapping + " " : mapping;
                                            }
                                            else {
                                                result += addSpace ? tokenName + " " : tokenName;
                                            }
                                        }
                                        else {
                                            result += `[Cannot generate value for virtual token ${token}]`;
                                        }
                                    }
                                    else {
                                        const state = this.lexerData.atn.ruleToStartState[tokenIndex];
                                        const [text] = this.generateFromATNSequence(state, state.stopState, !inLexer);
                                        result += text;
                                    }
                                }
                            }
                            run = transition.target;
                            break;
                        }
                    }
                }
            }
        }
        if (isRule) {
            this.leaveRule(ruleName);
            if (addSpace) {
                return [result + " ", blockedByPredicate];
            }
        }
        return [result, blockedByPredicate];
    }
    generateFromDecisionState(state, addSpace) {
        let result = "";
        let blocked = false;
        do {
            const decision = this.getRandomDecision(state);
            if (decision < 0) {
                return "";
            }
            const decisionCounts = state.atn === this.lexerData.atn
                ? this.lexerDecisionCounts
                : this.parserDecisionCounts;
            const altCounts = decisionCounts.get(state.decision);
            ++altCounts[decision];
            let endState;
            switch (state.stateType) {
                case atn_1.ATNStateType.STAR_BLOCK_START:
                case atn_1.ATNStateType.BLOCK_START: {
                    endState = state.endState;
                    break;
                }
                case atn_1.ATNStateType.PLUS_BLOCK_START: {
                    endState = state.loopBackState;
                    break;
                }
                default: {
                    throw new Error("Unhandled state type in sentence generator");
                }
            }
            [result, blocked] = this.generateFromATNSequence(state.transition(decision).target, endState, addSpace);
            if (blocked) {
                altCounts[decision] = 1e6;
            }
        } while (blocked);
        return result;
    }
    getRandomDecision(state) {
        const decisionCounts = state.atn === this.lexerData.atn ? this.lexerDecisionCounts : this.parserDecisionCounts;
        const weights = new Array(state.numberOfTransitions).fill(1);
        let altCounts = decisionCounts.get(state.decision);
        if (!altCounts) {
            altCounts = new Array(state.numberOfTransitions).fill(0);
            decisionCounts.set(state.decision, altCounts);
        }
        else {
            for (let i = 0; i < altCounts.length; ++i) {
                weights[i] = Math.pow(this.convergenceFactor, altCounts[i]);
            }
        }
        const sum = weights.reduce((accumulated, current) => {
            return accumulated + current;
        });
        let randomValue = Math.random() * sum;
        let randomIndex = 0;
        while (randomIndex < altCounts.length) {
            randomValue -= weights[randomIndex];
            if (randomValue < 0) {
                return randomIndex;
            }
            ++randomIndex;
        }
        return -1;
    }
    loopEnd(state) {
        for (const transition of state.getTransitions()) {
            if (transition.target.stateType === atn_1.ATNStateType.LOOP_END) {
                return transition.target;
            }
        }
        return undefined;
    }
    blockStart(state) {
        for (const transition of state.getTransitions()) {
            if (transition.target.stateType === atn_1.ATNStateType.STAR_BLOCK_START) {
                return transition.target;
            }
        }
    }
    getIntervalElement(set, index) {
        let runningIndex = 0;
        for (const interval of set.intervals) {
            const intervalSize = interval.b - interval.a + 1;
            if (index < runningIndex + intervalSize) {
                return interval.a + index - runningIndex;
            }
            runningIndex += intervalSize;
        }
        return runningIndex;
    }
    getRandomCharacterFromInterval(set) {
        const validSet = SentenceGenerator.printableUnicode.and(set);
        if (validSet.size === 0) {
            return String.fromCodePoint(this.getIntervalElement(set, Math.floor(Math.random() * set.size)));
        }
        return String.fromCodePoint(this.getIntervalElement(validSet, Math.floor(Math.random() * validSet.size)));
    }
    getRandomLoopCount(inLexer, forPlusLoop) {
        let min = inLexer ? this.minLexerIterations : this.minParserIterations;
        if (forPlusLoop && min === 0) {
            min = 1;
        }
        const max = inLexer ? this.maxLexerIterations : this.maxParserIterations;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    static {
        void (0, Unicode_1.printableUnicodePoints)({
            excludeCJK: true,
            excludeRTL: true,
            limitToBMP: false,
            includeLineTerminators: true,
        }).then((intervalSet) => {
            this.printableUnicode = intervalSet;
        });
    }
}
exports.SentenceGenerator = SentenceGenerator;
//# sourceMappingURL=SentenceGenerator.js.map
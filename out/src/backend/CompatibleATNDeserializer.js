"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompatibleATNDeserializer = void 0;
const atn_1 = require("antlr4ts/atn");
const misc_1 = require("antlr4ts/misc");
const Decorators_1 = require("antlr4ts/Decorators");
const antlr4ts_1 = require("antlr4ts");
const DFA_1 = require("antlr4ts/dfa/DFA");
class CompatibleATNDeserializer extends atn_1.ATNDeserializer {
    static BASE_SERIALIZED_UUID2 = misc_1.UUID.fromString("E4178468-DF95-44D0-AD87-F22A5D5FB6D3");
    static ADDED_LEXER_ACTIONS2 = misc_1.UUID.fromString("AB35191A-1603-487E-B75A-479B831EAF6D");
    static ADDED_UNICODE_SMP2 = misc_1.UUID.fromString("C23FEA89-0605-4f51-AFB8-058BCAB8C91B");
    static ADDED_UNICODE_SMP_ORIGINAL = misc_1.UUID.fromString("59627784-3BE5-417A-B9EB-8131A7286089");
    static SUPPORTED_UUIDS2 = [
        CompatibleATNDeserializer.BASE_SERIALIZED_UUID2,
        CompatibleATNDeserializer.ADDED_LEXER_ACTIONS2,
        CompatibleATNDeserializer.ADDED_UNICODE_SMP_ORIGINAL,
        CompatibleATNDeserializer.ADDED_UNICODE_SMP2,
    ];
    static SERIALIZED_UUID2 = CompatibleATNDeserializer.ADDED_UNICODE_SMP2;
    deserializationOptions2;
    constructor(deserializationOptions) {
        super(deserializationOptions);
        if (deserializationOptions == null) {
            deserializationOptions = atn_1.ATNDeserializationOptions.defaultOptions;
        }
        this.deserializationOptions2 = deserializationOptions;
    }
    static isFeatureSupported(feature, actualUuid) {
        const featureIndex = CompatibleATNDeserializer.SUPPORTED_UUIDS2.findIndex((e) => { return e.equals(feature); });
        if (featureIndex < 0) {
            return false;
        }
        return CompatibleATNDeserializer.SUPPORTED_UUIDS2.findIndex((e) => {
            return e.equals(actualUuid);
        }) >= featureIndex;
    }
    static getUnicodeDeserializer2(mode) {
        if (mode === 0) {
            return {
                readUnicode: (data, p) => { return atn_1.ATNDeserializer.toInt(data[p]); },
                size: 1,
            };
        }
        else {
            return {
                readUnicode: (data, p) => { return atn_1.ATNDeserializer.toInt32(data, p); },
                size: 2,
            };
        }
    }
    static inlineSetRules2(atn) {
        let inlinedCalls = 0;
        const ruleToInlineTransition = new Array(atn.ruleToStartState.length);
        for (let i = 0; i < atn.ruleToStartState.length; i++) {
            const startState = atn.ruleToStartState[i];
            let middleState = startState;
            while (middleState.onlyHasEpsilonTransitions
                && middleState.numberOfOptimizedTransitions === 1
                && middleState.getOptimizedTransition(0).serializationType === 1) {
                middleState = middleState.getOptimizedTransition(0).target;
            }
            if (middleState.numberOfOptimizedTransitions !== 1) {
                continue;
            }
            const matchTransition = middleState.getOptimizedTransition(0);
            const matchTarget = matchTransition.target;
            if (matchTransition.isEpsilon
                || !matchTarget.onlyHasEpsilonTransitions
                || matchTarget.numberOfOptimizedTransitions !== 1
                || !(matchTarget.getOptimizedTransition(0).target instanceof atn_1.RuleStopState)) {
                continue;
            }
            switch (matchTransition.serializationType) {
                case 5:
                case 2:
                case 7:
                    ruleToInlineTransition[i] = matchTransition;
                    break;
                case 8:
                case 9:
                    continue;
                default:
                    continue;
            }
        }
        for (const state of atn.states) {
            if (state.ruleIndex < 0) {
                continue;
            }
            let optimizedTransitions;
            for (let i = 0; i < state.numberOfOptimizedTransitions; i++) {
                const transition = state.getOptimizedTransition(i);
                if (!(transition instanceof atn_1.RuleTransition)) {
                    if (optimizedTransitions !== undefined) {
                        optimizedTransitions.push(transition);
                    }
                    continue;
                }
                const ruleTransition = transition;
                const effective = ruleToInlineTransition[ruleTransition.target.ruleIndex];
                if (effective == null) {
                    if (optimizedTransitions !== undefined) {
                        optimizedTransitions.push(transition);
                    }
                    continue;
                }
                if (optimizedTransitions == null) {
                    optimizedTransitions = [];
                    for (let j = 0; j < i; j++) {
                        optimizedTransitions.push(state.getOptimizedTransition(i));
                    }
                }
                inlinedCalls++;
                const target = ruleTransition.followState;
                const intermediateState = new atn_1.BasicState();
                intermediateState.setRuleIndex(target.ruleIndex);
                atn.addState(intermediateState);
                optimizedTransitions.push(new atn_1.EpsilonTransition(intermediateState));
                switch (effective.serializationType) {
                    case 5:
                        intermediateState.addTransition(new atn_1.AtomTransition(target, effective.label.maxElement));
                        break;
                    case 2:
                        intermediateState.addTransition(new atn_1.RangeTransition(target, effective.from, effective.to));
                        break;
                    case 7:
                        intermediateState.addTransition(new atn_1.SetTransition(target, effective.label));
                        break;
                    default:
                        throw new Error("UnsupportedOperationException");
                }
            }
            if (optimizedTransitions !== undefined) {
                if (state.isOptimized) {
                    while (state.numberOfOptimizedTransitions > 0) {
                        state.removeOptimizedTransition(state.numberOfOptimizedTransitions - 1);
                    }
                }
                for (const transition of optimizedTransitions) {
                    state.addOptimizedTransition(transition);
                }
            }
        }
        if (atn_1.ParserATNSimulator.debug) {
            console.log(`ATN runtime optimizer removed ${inlinedCalls} rule invocations by inlining sets.`);
        }
        return inlinedCalls;
    }
    static combineChainedEpsilons2(atn) {
        let removedEdges = 0;
        for (const state of atn.states) {
            if (!state.onlyHasEpsilonTransitions || state instanceof atn_1.RuleStopState) {
                continue;
            }
            let optimizedTransitions;
            nextTransition: for (let i = 0; i < state.numberOfOptimizedTransitions; i++) {
                const transition = state.getOptimizedTransition(i);
                const intermediate = transition.target;
                if (transition.serializationType !== 1
                    || transition.outermostPrecedenceReturn !== -1
                    || intermediate.stateType !== atn_1.ATNStateType.BASIC
                    || !intermediate.onlyHasEpsilonTransitions) {
                    if (optimizedTransitions !== undefined) {
                        optimizedTransitions.push(transition);
                    }
                    continue;
                }
                for (let j = 0; j < intermediate.numberOfOptimizedTransitions; j++) {
                    if (intermediate.getOptimizedTransition(j).serializationType !== 1
                        || intermediate.getOptimizedTransition(j)
                            .outermostPrecedenceReturn !== -1) {
                        if (optimizedTransitions !== undefined) {
                            optimizedTransitions.push(transition);
                        }
                        continue nextTransition;
                    }
                }
                removedEdges++;
                if (optimizedTransitions == null) {
                    optimizedTransitions = [];
                    for (let j = 0; j < i; j++) {
                        optimizedTransitions.push(state.getOptimizedTransition(j));
                    }
                }
                for (let j = 0; j < intermediate.numberOfOptimizedTransitions; j++) {
                    const target = intermediate.getOptimizedTransition(j).target;
                    optimizedTransitions.push(new atn_1.EpsilonTransition(target));
                }
            }
            if (optimizedTransitions !== undefined) {
                if (state.isOptimized) {
                    while (state.numberOfOptimizedTransitions > 0) {
                        state.removeOptimizedTransition(state.numberOfOptimizedTransitions - 1);
                    }
                }
                for (const transition of optimizedTransitions) {
                    state.addOptimizedTransition(transition);
                }
            }
        }
        if (atn_1.ParserATNSimulator.debug) {
            console.log(`ATN runtime optimizer removed ${removedEdges} transitions by combining chained epsilon ` +
                `transitions.`);
        }
        return removedEdges;
    }
    static optimizeSets2(atn, preserveOrder) {
        if (preserveOrder) {
            return 0;
        }
        let removedPaths = 0;
        const decisions = atn.decisionToState;
        for (const decision of decisions) {
            const setTransitions = new misc_1.IntervalSet();
            for (let i = 0; i < decision.numberOfOptimizedTransitions; i++) {
                const epsTransition = decision.getOptimizedTransition(i);
                if (!(epsTransition instanceof atn_1.EpsilonTransition)) {
                    continue;
                }
                if (epsTransition.target.numberOfOptimizedTransitions !== 1) {
                    continue;
                }
                const transition = epsTransition.target.getOptimizedTransition(0);
                if (!(transition.target instanceof atn_1.BlockEndState)) {
                    continue;
                }
                if (transition instanceof atn_1.NotSetTransition) {
                    continue;
                }
                if (transition instanceof atn_1.AtomTransition
                    || transition instanceof atn_1.RangeTransition
                    || transition instanceof atn_1.SetTransition) {
                    setTransitions.add(i);
                }
            }
            if (setTransitions.size <= 1) {
                continue;
            }
            const optimizedTransitions = [];
            for (let i = 0; i < decision.numberOfOptimizedTransitions; i++) {
                if (!setTransitions.contains(i)) {
                    optimizedTransitions.push(decision.getOptimizedTransition(i));
                }
            }
            const blockEndState = decision.getOptimizedTransition(setTransitions.minElement).target
                .getOptimizedTransition(0).target;
            const matchSet = new misc_1.IntervalSet();
            for (const interval of setTransitions.intervals) {
                for (let j = interval.a; j <= interval.b; j++) {
                    const matchTransition = decision.getOptimizedTransition(j).target.getOptimizedTransition(0);
                    if (matchTransition instanceof atn_1.NotSetTransition) {
                        throw new Error("Not yet implemented.");
                    }
                    else {
                        matchSet.addAll(matchTransition.label);
                    }
                }
            }
            let newTransition;
            if (matchSet.intervals.length === 1) {
                if (matchSet.size === 1) {
                    newTransition = new atn_1.AtomTransition(blockEndState, matchSet.minElement);
                }
                else {
                    const matchInterval = matchSet.intervals[0];
                    newTransition = new atn_1.RangeTransition(blockEndState, matchInterval.a, matchInterval.b);
                }
            }
            else {
                newTransition = new atn_1.SetTransition(blockEndState, matchSet);
            }
            const setOptimizedState = new atn_1.BasicState();
            setOptimizedState.setRuleIndex(decision.ruleIndex);
            atn.addState(setOptimizedState);
            setOptimizedState.addTransition(newTransition);
            optimizedTransitions.push(new atn_1.EpsilonTransition(setOptimizedState));
            removedPaths += decision.numberOfOptimizedTransitions - optimizedTransitions.length;
            if (decision.isOptimized) {
                while (decision.numberOfOptimizedTransitions > 0) {
                    decision.removeOptimizedTransition(decision.numberOfOptimizedTransitions - 1);
                }
            }
            for (const transition of optimizedTransitions) {
                decision.addOptimizedTransition(transition);
            }
        }
        if (atn_1.ParserATNSimulator.debug) {
            console.log(`ATN runtime optimizer removed ${removedPaths} paths by collapsing sets.`);
        }
        return removedPaths;
    }
    static identifyTailCalls2(atn) {
        for (const state of atn.states) {
            for (let i = 0; i < state.numberOfTransitions; i++) {
                const transition = state.transition(i);
                if (!(transition instanceof atn_1.RuleTransition)) {
                    continue;
                }
                transition.tailCall = this.testTailCall2(atn, transition, false);
                transition.optimizedTailCall = this.testTailCall2(atn, transition, true);
            }
            if (!state.isOptimized) {
                continue;
            }
            for (let i = 0; i < state.numberOfOptimizedTransitions; i++) {
                const transition = state.getOptimizedTransition(i);
                if (!(transition instanceof atn_1.RuleTransition)) {
                    continue;
                }
                transition.tailCall = this.testTailCall2(atn, transition, false);
                transition.optimizedTailCall = this.testTailCall2(atn, transition, true);
            }
        }
    }
    static testTailCall2(atn, transition, optimizedPath) {
        if (!optimizedPath && transition.tailCall) {
            return true;
        }
        if (optimizedPath && transition.optimizedTailCall) {
            return true;
        }
        const reachable = new misc_1.BitSet(atn.states.length);
        const worklist = [];
        worklist.push(transition.followState);
        while (true) {
            const state = worklist.pop();
            if (!state) {
                break;
            }
            if (reachable.get(state.stateNumber)) {
                continue;
            }
            if (state instanceof atn_1.RuleStopState) {
                continue;
            }
            if (!state.onlyHasEpsilonTransitions) {
                return false;
            }
            const transitionCount = optimizedPath ? state.numberOfOptimizedTransitions : state.numberOfTransitions;
            for (let i = 0; i < transitionCount; i++) {
                const t = optimizedPath ? state.getOptimizedTransition(i) : state.transition(i);
                if (t.serializationType !== 1) {
                    return false;
                }
                worklist.push(t.target);
            }
        }
        return true;
    }
    deserialize(data) {
        const version = data[0];
        if (version !== atn_1.ATNDeserializer.SERIALIZED_VERSION) {
            const reason = `Could not deserialize ATN with version ${version} (expected ${atn_1.ATNDeserializer.SERIALIZED_VERSION}).`;
            throw new Error(reason);
        }
        data.forEach((value, index, array) => {
            array[index] = (value - 2) & 0xFFFF;
        });
        let p = 1;
        const uuid = atn_1.ATNDeserializer.toUUID(data, p);
        p += 8;
        if (CompatibleATNDeserializer.SUPPORTED_UUIDS2.findIndex((e) => { return e.equals(uuid); }) < 0) {
            const reason = `Could not deserialize ATN with UUID ${uuid.toString()} (expected ` +
                `${CompatibleATNDeserializer.SERIALIZED_UUID2.toString()} or a legacy UUID).`;
            throw new Error(reason);
        }
        const generatedByOriginalANTLR4 = uuid.equals(CompatibleATNDeserializer.ADDED_UNICODE_SMP_ORIGINAL);
        const supportsLexerActions = CompatibleATNDeserializer.isFeatureSupported(CompatibleATNDeserializer.ADDED_LEXER_ACTIONS2, uuid);
        const grammarType = data[p++];
        const maxTokenType = data[p++];
        const atn = new atn_1.ATN(grammarType, maxTokenType);
        const loopBackStateNumbers = [];
        const endStateNumbers = [];
        const nstates = data[p++];
        for (let i = 0; i < nstates; i++) {
            const stype = data[p++];
            if (stype === atn_1.ATNStateType.INVALID_TYPE) {
                atn.addState(new atn_1.InvalidState());
                continue;
            }
            let ruleIndex = data[p++];
            if (ruleIndex === 0xFFFF) {
                ruleIndex = -1;
            }
            const s = this.stateFactory(stype, ruleIndex);
            if (stype === atn_1.ATNStateType.LOOP_END) {
                const loopBackStateNumber = data[p++];
                loopBackStateNumbers.push([s, loopBackStateNumber]);
            }
            else if (s instanceof atn_1.BlockStartState) {
                const endStateNumber = data[p++];
                endStateNumbers.push([s, endStateNumber]);
            }
            atn.addState(s);
        }
        for (const pair of loopBackStateNumbers) {
            pair[0].loopBackState = atn.states[pair[1]];
        }
        for (const pair of endStateNumbers) {
            pair[0].endState = atn.states[pair[1]];
        }
        const numNonGreedyStates = data[p++];
        for (let i = 0; i < numNonGreedyStates; i++) {
            const stateNumber = data[p++];
            atn.states[stateNumber].nonGreedy = true;
        }
        if (!generatedByOriginalANTLR4) {
            const numSllDecisions = data[p++];
            for (let i = 0; i < numSllDecisions; i++) {
                const stateNumber = data[p++];
                atn.states[stateNumber].sll = true;
            }
        }
        const numPrecedenceStates = data[p++];
        for (let i = 0; i < numPrecedenceStates; i++) {
            const stateNumber = data[p++];
            atn.states[stateNumber].isPrecedenceRule = true;
        }
        const nrules = data[p++];
        if (atn.grammarType === 0) {
            atn.ruleToTokenType = new Int32Array(nrules);
        }
        atn.ruleToStartState = new Array(nrules);
        for (let i = 0; i < nrules; i++) {
            const s = data[p++];
            const startState = atn.states[s];
            if (!generatedByOriginalANTLR4) {
                startState.leftFactored = data[p++] !== 0;
            }
            atn.ruleToStartState[i] = startState;
            if (atn.grammarType === 0) {
                let tokenType = data[p++];
                if (tokenType === 0xFFFF) {
                    tokenType = antlr4ts_1.Token.EOF;
                }
                atn.ruleToTokenType[i] = tokenType;
                if (!CompatibleATNDeserializer.isFeatureSupported(CompatibleATNDeserializer.ADDED_LEXER_ACTIONS2, uuid)) {
                    let actionIndexIgnored = data[p++];
                    if (actionIndexIgnored === 0xFFFF) {
                        actionIndexIgnored = -1;
                    }
                }
            }
        }
        atn.ruleToStopState = new Array(nrules);
        for (const state of atn.states) {
            if (!(state instanceof atn_1.RuleStopState)) {
                continue;
            }
            atn.ruleToStopState[state.ruleIndex] = state;
            atn.ruleToStartState[state.ruleIndex].stopState = state;
        }
        const nmodes = data[p++];
        for (let i = 0; i < nmodes; i++) {
            const s = data[p++];
            atn.modeToStartState.push(atn.states[s]);
        }
        atn.modeToDFA = new Array(nmodes);
        for (let i = 0; i < nmodes; i++) {
            atn.modeToDFA[i] = new DFA_1.DFA(atn.modeToStartState[i]);
        }
        const sets = [];
        p = this.deserializeSets2(data, p, sets, CompatibleATNDeserializer.getUnicodeDeserializer2(0));
        if (CompatibleATNDeserializer.isFeatureSupported(CompatibleATNDeserializer.ADDED_UNICODE_SMP2, uuid)
            || CompatibleATNDeserializer.isFeatureSupported(CompatibleATNDeserializer.ADDED_UNICODE_SMP_ORIGINAL, uuid)) {
            p = this.deserializeSets2(data, p, sets, CompatibleATNDeserializer.getUnicodeDeserializer2(1));
        }
        const nedges = data[p++];
        for (let i = 0; i < nedges; i++) {
            const src = atn_1.ATNDeserializer.toInt(data[p]);
            const trg = atn_1.ATNDeserializer.toInt(data[p + 1]);
            const ttype = atn_1.ATNDeserializer.toInt(data[p + 2]);
            const arg1 = atn_1.ATNDeserializer.toInt(data[p + 3]);
            const arg2 = atn_1.ATNDeserializer.toInt(data[p + 4]);
            const arg3 = atn_1.ATNDeserializer.toInt(data[p + 5]);
            const trans = this.edgeFactory(atn, ttype, src, trg, arg1, arg2, arg3, sets);
            const srcState = atn.states[src];
            srcState.addTransition(trans);
            p += 6;
        }
        const returnTransitionsSet = new misc_1.Array2DHashSet({
            hashCode: (o) => { return o.stopState ^ o.returnState ^ o.outermostPrecedenceReturn; },
            equals: (a, b) => {
                return a.stopState === b.stopState
                    && a.returnState === b.returnState
                    && a.outermostPrecedenceReturn === b.outermostPrecedenceReturn;
            },
        });
        const returnTransitions = [];
        for (const state of atn.states) {
            const returningToLeftFactored = state.ruleIndex >= 0
                && atn.ruleToStartState[state.ruleIndex].leftFactored;
            for (let i = 0; i < state.numberOfTransitions; i++) {
                const t = state.transition(i);
                if (!(t instanceof atn_1.RuleTransition)) {
                    continue;
                }
                const ruleTransition = t;
                const returningFromLeftFactored = atn.ruleToStartState[ruleTransition.target.ruleIndex].leftFactored;
                if (!returningFromLeftFactored && returningToLeftFactored) {
                    continue;
                }
                let outermostPrecedenceReturn = -1;
                if (atn.ruleToStartState[ruleTransition.target.ruleIndex].isPrecedenceRule) {
                    if (ruleTransition.precedence === 0) {
                        outermostPrecedenceReturn = ruleTransition.target.ruleIndex;
                    }
                }
                const current = {
                    stopState: ruleTransition.target.ruleIndex,
                    returnState: ruleTransition.followState.stateNumber,
                    outermostPrecedenceReturn,
                };
                if (returnTransitionsSet.add(current)) {
                    returnTransitions.push(current);
                }
            }
        }
        for (const returnTransition of returnTransitions) {
            const transition = new atn_1.EpsilonTransition(atn.states[returnTransition.returnState], returnTransition.outermostPrecedenceReturn);
            atn.ruleToStopState[returnTransition.stopState].addTransition(transition);
        }
        for (const state of atn.states) {
            if (state instanceof atn_1.BlockStartState) {
                if (state.endState == null) {
                    throw new Error("IllegalStateException");
                }
                if (state.endState.startState !== undefined) {
                    throw new Error("IllegalStateException");
                }
                state.endState.startState = state;
            }
            if (state instanceof atn_1.PlusLoopbackState) {
                const loopbackState = state;
                for (let i = 0; i < loopbackState.numberOfTransitions; i++) {
                    const target = loopbackState.transition(i).target;
                    if (target instanceof atn_1.PlusBlockStartState) {
                        target.loopBackState = loopbackState;
                    }
                }
            }
            else if (state instanceof atn_1.StarLoopbackState) {
                const loopbackState = state;
                for (let i = 0; i < loopbackState.numberOfTransitions; i++) {
                    const target = loopbackState.transition(i).target;
                    if (target instanceof atn_1.StarLoopEntryState) {
                        target.loopBackState = loopbackState;
                    }
                }
            }
        }
        const ndecisions = data[p++];
        for (let i = 1; i <= ndecisions; i++) {
            const s = data[p++];
            const decState = atn.states[s];
            atn.decisionToState.push(decState);
            decState.decision = i - 1;
        }
        if (atn.grammarType === 0) {
            if (supportsLexerActions) {
                atn.lexerActions = new Array(data[p++]);
                for (let i = 0; i < atn.lexerActions.length; i++) {
                    const actionType = data[p++];
                    let data1 = data[p++];
                    if (data1 === 0xFFFF) {
                        data1 = -1;
                    }
                    let data2 = data[p++];
                    if (data2 === 0xFFFF) {
                        data2 = -1;
                    }
                    const lexerAction = this.lexerActionFactory(actionType, data1, data2);
                    atn.lexerActions[i] = lexerAction;
                }
            }
            else {
                const legacyLexerActions = [];
                for (const state of atn.states) {
                    for (let i = 0; i < state.numberOfTransitions; i++) {
                        const transition = state.transition(i);
                        if (!(transition instanceof atn_1.ActionTransition)) {
                            continue;
                        }
                        const ruleIndex = transition.ruleIndex;
                        const actionIndex = transition.actionIndex;
                        const lexerAction = new atn_1.LexerCustomAction(ruleIndex, actionIndex);
                        state.setTransition(i, new atn_1.ActionTransition(transition.target, ruleIndex, legacyLexerActions.length, false));
                        legacyLexerActions.push(lexerAction);
                    }
                }
                atn.lexerActions = legacyLexerActions;
            }
        }
        this.markPrecedenceDecisions(atn);
        atn.decisionToDFA = new Array(ndecisions);
        for (let i = 0; i < ndecisions; i++) {
            atn.decisionToDFA[i] = new DFA_1.DFA(atn.decisionToState[i], i);
        }
        if (this.deserializationOptions2.isVerifyATN) {
            this.verifyATN(atn);
        }
        if (this.deserializationOptions2.isGenerateRuleBypassTransitions && atn.grammarType === 1) {
            atn.ruleToTokenType = new Int32Array(atn.ruleToStartState.length);
            for (let i = 0; i < atn.ruleToStartState.length; i++) {
                atn.ruleToTokenType[i] = atn.maxTokenType + i + 1;
            }
            for (let i = 0; i < atn.ruleToStartState.length; i++) {
                const bypassStart = new atn_1.BasicBlockStartState();
                bypassStart.ruleIndex = i;
                atn.addState(bypassStart);
                const bypassStop = new atn_1.BlockEndState();
                bypassStop.ruleIndex = i;
                atn.addState(bypassStop);
                bypassStart.endState = bypassStop;
                atn.defineDecisionState(bypassStart);
                bypassStop.startState = bypassStart;
                let endState;
                let excludeTransition;
                if (atn.ruleToStartState[i].isPrecedenceRule) {
                    endState = undefined;
                    for (const state of atn.states) {
                        if (state.ruleIndex !== i) {
                            continue;
                        }
                        if (!(state instanceof atn_1.StarLoopEntryState)) {
                            continue;
                        }
                        const maybeLoopEndState = state.transition(state.numberOfTransitions - 1).target;
                        if (!(maybeLoopEndState instanceof atn_1.LoopEndState)) {
                            continue;
                        }
                        if (maybeLoopEndState.epsilonOnlyTransitions
                            && maybeLoopEndState.transition(0).target instanceof atn_1.RuleStopState) {
                            endState = state;
                            break;
                        }
                    }
                    if (!endState) {
                        throw new Error("Couldn't identify final state of the precedence rule prefix section.");
                    }
                    excludeTransition = endState.loopBackState.transition(0);
                }
                else {
                    endState = atn.ruleToStopState[i];
                }
                for (const state of atn.states) {
                    for (let tansitionIndex = 0; tansitionIndex < state.numberOfTransitions; tansitionIndex++) {
                        const transition = state.transition(tansitionIndex);
                        if (transition === excludeTransition) {
                            continue;
                        }
                        if (transition.target === endState) {
                            transition.target = bypassStop;
                        }
                    }
                }
                while (atn.ruleToStartState[i].numberOfTransitions > 0) {
                    const transition = atn.ruleToStartState[i].removeTransition(atn.ruleToStartState[i].numberOfTransitions - 1);
                    bypassStart.addTransition(transition);
                }
                atn.ruleToStartState[i].addTransition(new atn_1.EpsilonTransition(bypassStart));
                bypassStop.addTransition(new atn_1.EpsilonTransition(endState));
                const matchState = new atn_1.BasicState();
                atn.addState(matchState);
                matchState.addTransition(new atn_1.AtomTransition(bypassStop, atn.ruleToTokenType[i]));
                bypassStart.addTransition(new atn_1.EpsilonTransition(matchState));
            }
            if (this.deserializationOptions2.isVerifyATN) {
                this.verifyATN(atn);
            }
        }
        if (this.deserializationOptions2.isOptimize) {
            while (true) {
                let optimizationCount = 0;
                optimizationCount += CompatibleATNDeserializer.inlineSetRules2(atn);
                optimizationCount += CompatibleATNDeserializer.combineChainedEpsilons2(atn);
                const preserveOrder = atn.grammarType === 0;
                optimizationCount += CompatibleATNDeserializer.optimizeSets2(atn, preserveOrder);
                if (optimizationCount === 0) {
                    break;
                }
            }
            if (this.deserializationOptions2.isVerifyATN) {
                this.verifyATN(atn);
            }
        }
        CompatibleATNDeserializer.identifyTailCalls2(atn);
        return atn;
    }
    deserializeSets2(data, p, sets, unicodeDeserializer) {
        const nsets = data[p++];
        for (let i = 0; i < nsets; i++) {
            const nintervals = atn_1.ATNDeserializer.toInt(data[p]);
            p++;
            const set = new misc_1.IntervalSet();
            sets.push(set);
            const containsEof = data[p++] !== 0;
            if (containsEof) {
                set.add(-1);
            }
            for (let j = 0; j < nintervals; j++) {
                const a = unicodeDeserializer.readUnicode(data, p);
                p += unicodeDeserializer.size;
                const b = unicodeDeserializer.readUnicode(data, p);
                p += unicodeDeserializer.size;
                set.add(a, b);
            }
        }
        return p;
    }
}
__decorate([
    Decorators_1.NotNull
], CompatibleATNDeserializer.prototype, "deserializationOptions2", void 0);
__decorate([
    __param(0, Decorators_1.NotNull)
], CompatibleATNDeserializer.prototype, "deserialize", null);
exports.CompatibleATNDeserializer = CompatibleATNDeserializer;
//# sourceMappingURL=CompatibleATNDeserializer.js.map
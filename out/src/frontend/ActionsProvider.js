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
exports.ActionsProvider = exports.ChildEntry = exports.RootEntry = void 0;
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
const AntlrTreeDataProvider_1 = require("./AntlrTreeDataProvider");
const types_1 = require("../backend/types");
const FrontendUtils_1 = require("./FrontendUtils");
class RootEntry extends vscode_1.TreeItem {
    contextValue = "actions";
    constructor(label, id) {
        super(label, vscode_1.TreeItemCollapsibleState.Expanded);
        this.id = id;
    }
}
exports.RootEntry = RootEntry;
class ChildEntry extends vscode_1.TreeItem {
    parent;
    range;
    static imageBaseNames = new Map([
        [types_1.CodeActionType.GlobalNamed, "named-action"],
        [types_1.CodeActionType.LocalNamed, "named-action"],
        [types_1.CodeActionType.ParserAction, "parser-action"],
        [types_1.CodeActionType.LexerAction, "parser-action"],
        [types_1.CodeActionType.ParserPredicate, "predicate"],
        [types_1.CodeActionType.LexerPredicate, "predicate"],
    ]);
    contextValue = "action";
    constructor(parent, label, type, range, command) {
        super(label, vscode_1.TreeItemCollapsibleState.None);
        this.parent = parent;
        this.range = range;
        this.command = command;
        const baseName = ChildEntry.imageBaseNames.get(type);
        if (baseName) {
            this.contextValue = baseName;
            this.iconPath = {
                light: path.join(__dirname, "..", "..", "..", "misc", baseName + "-light.svg"),
                dark: path.join(__dirname, "..", "..", "..", "misc", baseName + "-dark.svg"),
            };
        }
    }
}
exports.ChildEntry = ChildEntry;
class ActionsProvider extends AntlrTreeDataProvider_1.AntlrTreeDataProvider {
    actionTree;
    globalNamedActionsRoot;
    localNamedActionsRoot;
    parserActionsRoot;
    lexerActionsRoot;
    parserPredicatesRoot;
    lexerPredicatesRoot;
    globalNamedActions = [];
    localNamedActions = [];
    parserActions = [];
    lexerActions = [];
    parserPredicates = [];
    lexerPredicates = [];
    update(editor) {
        const position = editor.selection.active;
        let action = FrontendUtils_1.FrontendUtils.findInListFromPosition(this.globalNamedActions, position.character, position.line + 1);
        if (!action) {
            action = FrontendUtils_1.FrontendUtils.findInListFromPosition(this.localNamedActions, position.character, position.line + 1);
        }
        if (!action) {
            action = FrontendUtils_1.FrontendUtils.findInListFromPosition(this.parserActions, position.character, position.line + 1);
        }
        if (!action) {
            action = FrontendUtils_1.FrontendUtils.findInListFromPosition(this.lexerActions, position.character, position.line + 1);
        }
        if (!action) {
            action = FrontendUtils_1.FrontendUtils.findInListFromPosition(this.parserPredicates, position.character, position.line + 1);
        }
        if (!action) {
            action = FrontendUtils_1.FrontendUtils.findInListFromPosition(this.lexerPredicates, position.character, position.line + 1);
        }
        if (action) {
            void this.actionTree.reveal(action, { select: true });
        }
    }
    getParent(element) {
        if (element instanceof RootEntry) {
            return undefined;
        }
        return element.parent;
    }
    getChildren(element) {
        if (!this.currentFile) {
            return null;
        }
        if (!element) {
            return this.createRootEntries();
        }
        return new Promise((resolve, reject) => {
            if (!this.currentFile) {
                resolve(undefined);
                return;
            }
            try {
                let listType;
                let parent;
                let list;
                switch (element.id) {
                    case "parserActions": {
                        this.parserActions = [];
                        list = this.parserActions;
                        listType = types_1.CodeActionType.ParserAction;
                        parent = this.parserActionsRoot;
                        break;
                    }
                    case "lexerActions": {
                        this.lexerActions = [];
                        list = this.lexerActions;
                        listType = types_1.CodeActionType.LexerAction;
                        parent = this.lexerActionsRoot;
                        break;
                    }
                    case "parserPredicates": {
                        this.parserPredicates = [];
                        list = this.parserPredicates;
                        listType = types_1.CodeActionType.ParserPredicate;
                        parent = this.parserPredicatesRoot;
                        break;
                    }
                    case "lexerPredicates": {
                        this.lexerPredicates = [];
                        list = this.lexerPredicates;
                        listType = types_1.CodeActionType.LexerPredicate;
                        parent = this.lexerPredicatesRoot;
                        break;
                    }
                    case "globalNamedActions": {
                        this.globalNamedActions = [];
                        list = this.globalNamedActions;
                        listType = types_1.CodeActionType.GlobalNamed;
                        parent = this.globalNamedActionsRoot;
                        break;
                    }
                    default: {
                        this.localNamedActions = [];
                        list = this.localNamedActions;
                        listType = types_1.CodeActionType.LocalNamed;
                        parent = this.localNamedActionsRoot;
                        break;
                    }
                }
                const actions = this.backend.listActions(this.currentFile, listType);
                actions.forEach((action, index) => {
                    let caption = action.name.length > 0 ? action.name : String(index);
                    if (action.description) {
                        if (action.description.includes("\n")) {
                            caption += ": <multi line block>";
                        }
                        else {
                            caption += ": " + action.description;
                        }
                    }
                    const range = action && action.definition ? action.definition.range : undefined;
                    const command = action ? {
                        title: "Select Grammar Range",
                        command: "antlr.selectGrammarRange",
                        arguments: [range],
                    } : undefined;
                    const item = new ChildEntry(parent, caption.trim(), listType, range, command);
                    list.push(item);
                });
                resolve(list);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    createRootEntries() {
        return new Promise((resolve, reject) => {
            if (!this.currentFile) {
                return null;
            }
            try {
                const rootList = [];
                const counts = this.backend.getActionCounts(this.currentFile);
                if ((counts.get(types_1.CodeActionType.GlobalNamed) ?? 0) > 0) {
                    this.globalNamedActionsRoot = new RootEntry("Global Named Actions", "globalNamedActions");
                    this.globalNamedActionsRoot.tooltip = "Code which is embedded into the generated files " +
                        "at specific locations (like the head of the file).\n\n" +
                        "This code does not take part in the parsing process and is not represented in the ATN.";
                    rootList.push(this.globalNamedActionsRoot);
                }
                if ((counts.get(types_1.CodeActionType.LocalNamed) ?? 0) > 0) {
                    this.localNamedActionsRoot = new RootEntry("Local Named Actions", "localNamedActions");
                    this.localNamedActionsRoot.tooltip = "Code which is embedded into the generated parser code " +
                        "for a rule, like initialization code (@init). \n\n" +
                        "This code is directly executed during the parsing process, but is not represented in the ATN.";
                    rootList.push(this.localNamedActionsRoot);
                }
                if ((counts.get(types_1.CodeActionType.ParserAction) ?? 0) > 0) {
                    this.parserActionsRoot = new RootEntry("Parser Actions", "parserActions");
                    this.parserActionsRoot.tooltip = "Code which is embedded into the generated parser " +
                        "code and executed as part of the parsing process. There are also transitions in the ATN for " +
                        "each action, but they are not used from the generated parser (all action indices are -1).";
                    rootList.push(this.parserActionsRoot);
                }
                if ((counts.get(types_1.CodeActionType.LexerAction) ?? 0) > 0) {
                    this.lexerActionsRoot = new RootEntry("Lexer Actions", "lexerActions");
                    this.lexerActionsRoot.tooltip = "Lexer rules are executed in a state machine without " +
                        "any embedded code. However lexer actions are held in generated private methods addressed " +
                        "by an action index given in the action transition between 2 ATN nodes.";
                    rootList.push(this.lexerActionsRoot);
                }
                if ((counts.get(types_1.CodeActionType.ParserPredicate) ?? 0) > 0) {
                    this.parserPredicatesRoot = new RootEntry("Parser Predicates", "parserPredicates");
                    this.parserPredicatesRoot.tooltip = "Semantic predicates are code snippets which can enable or " +
                        "disable a specific alternative in a rule. They are generated in separate methods and are " +
                        "addressed by an index just like lexer actions.\n\n" +
                        "The ATN representation of a predicate is a predicate transition between 2 ATN nodes.";
                    rootList.push(this.parserPredicatesRoot);
                }
                if ((counts.get(types_1.CodeActionType.LexerPredicate) ?? 0) > 0) {
                    this.lexerPredicatesRoot = new RootEntry("Lexer Predicates", "lexerPredicates");
                    this.lexerPredicatesRoot.tooltip = "Semantic predicates are code snippets which can enable or " +
                        "disable a specific alternative in a rule. They are generated in separate methods and are " +
                        "addressed by an index just like lexer actions.\n\n" +
                        "The ATN representation of a predicate is a predicate transition between 2 ATN nodes.";
                    rootList.push(this.lexerPredicatesRoot);
                }
                resolve(rootList);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.ActionsProvider = ActionsProvider;
//# sourceMappingURL=ActionsProvider.js.map
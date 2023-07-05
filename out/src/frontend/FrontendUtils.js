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
exports.FrontendUtils = void 0;
const fs = __importStar(require("fs-extra"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
const types_1 = require("../backend/types");
class FrontendUtils {
    static getMiscPath(file, context, webview) {
        if (webview) {
            const uri = vscode_1.Uri.file(context.asAbsolutePath(path.join("misc", file)));
            return webview.asWebviewUri(uri).toString();
        }
        return context.asAbsolutePath(path.join("misc", file));
    }
    static getOutPath(file, context, webview) {
        if (webview) {
            const uri = vscode_1.Uri.file(context.asAbsolutePath(path.join("out", file)));
            return webview.asWebviewUri(uri).toString();
        }
        return context.asAbsolutePath(path.join("out", file));
    }
    static getNodeModulesPath(webview, file, context) {
        const path = vscode_1.Uri.joinPath(context.extensionUri, "node_modules", file);
        return webview.asWebviewUri(path).toString();
    }
    static isAbsolute(p) {
        return path.normalize(p + "/") === path.normalize(path.resolve(p) + "/");
    }
    static deleteFolderRecursive(target) {
        let files = [];
        if (fs.existsSync(target)) {
            files = fs.readdirSync(target);
            files.forEach((file) => {
                const curPath = path.join(target, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    FrontendUtils.deleteFolderRecursive(curPath);
                }
                else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(target);
        }
    }
    static hashForPath(dataPath) {
        return crypto.createHash("md5").update(dataPath).digest("hex");
    }
    static copyFilesIfNewer(files, targetPath) {
        try {
            fs.ensureDirSync(targetPath);
        }
        catch (error) {
            void vscode_1.window.showErrorMessage(`Could not create target folder '${targetPath}'. ${String(error)}`);
        }
        for (const file of files) {
            try {
                let canCopy = true;
                const targetFile = path.join(targetPath, path.basename(file));
                if (fs.existsSync(targetFile)) {
                    const sourceStat = fs.statSync(file);
                    const targetStat = fs.statSync(targetFile);
                    canCopy = targetStat.mtime < sourceStat.mtime;
                }
                if (canCopy) {
                    void fs.copy(file, targetFile, { overwrite: true });
                }
            }
            catch (error) {
                void vscode_1.window.showErrorMessage(`Could not copy file '${file}'. ${String(error)}`);
            }
        }
    }
    static exportDataWithConfirmation(fileName, filters, data, extraFiles) {
        void vscode_1.window.showSaveDialog({
            defaultUri: vscode_1.Uri.file(fileName),
            filters,
        }).then((uri) => {
            if (uri) {
                const value = uri.fsPath;
                fs.writeFile(value, data, (error) => {
                    if (error) {
                        void vscode_1.window.showErrorMessage("Could not write to file: " + value + ": " + error.message);
                    }
                    else {
                        this.copyFilesIfNewer(extraFiles, path.dirname(value));
                        void vscode_1.window.showInformationMessage("Diagram successfully written to file '" + value + "'.");
                    }
                });
            }
        });
    }
    static findInListFromPosition(list, column, row) {
        for (const entry of list) {
            if (!entry.range) {
                continue;
            }
            const start = entry.range.start;
            const stop = entry.range.end;
            let matched = start.row <= row && stop.row >= row;
            if (matched) {
                if (start.row === row) {
                    matched = start.column <= column;
                }
                else if (stop.row === row) {
                    matched = stop.column >= column;
                }
            }
            if (matched) {
                return entry;
            }
        }
        return undefined;
    }
    static switchVsCodeContext(key, enable) {
        return vscode_1.commands.executeCommand("setContext", key, enable);
    }
    static isGrammarFile(document) {
        return document ? (document.languageId === "antlr" && document.uri.scheme === "file") : false;
    }
    static updateVsCodeContext(backend, document) {
        if (document && FrontendUtils.isGrammarFile(document)) {
            const info = backend.getContextDetails(document.fileName);
            1;
            void FrontendUtils.switchVsCodeContext("antlr4.isLexer", info.type === types_1.GrammarType.Lexer);
            void FrontendUtils.switchVsCodeContext("antlr4.isParser", info.type === types_1.GrammarType.Parser);
            void FrontendUtils.switchVsCodeContext("antlr4.isCombined", info.type === types_1.GrammarType.Combined);
            void FrontendUtils.switchVsCodeContext("antlr4.hasImports", info.imports.length > 0);
        }
    }
}
exports.FrontendUtils = FrontendUtils;
//# sourceMappingURL=FrontendUtils.js.map
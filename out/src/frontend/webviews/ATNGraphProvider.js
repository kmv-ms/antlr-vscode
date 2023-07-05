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
exports.ATNGraphProvider = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const WebviewProvider_1 = require("./WebviewProvider");
const FrontendUtils_1 = require("../FrontendUtils");
const vscode_1 = require("vscode");
const atn_1 = require("antlr4ts/atn");
class ATNGraphProvider extends WebviewProvider_1.WebviewProvider {
    static cachedATNTransformations = {};
    static addStatesForGrammar(root, grammar) {
        const hash = FrontendUtils_1.FrontendUtils.hashForPath(grammar);
        const atnCacheFile = path.join(root, "cache", hash + ".atn");
        if (fs.existsSync(atnCacheFile)) {
            const data = fs.readFileSync(atnCacheFile, { encoding: "utf-8" });
            try {
                const fileEntry = JSON.parse(data);
                ATNGraphProvider.cachedATNTransformations[hash] = fileEntry;
            }
            catch (e) {
            }
        }
    }
    generateContent(webview, uri) {
        const graphData = this.prepareRenderData(uri);
        const rendererScriptPath = FrontendUtils_1.FrontendUtils.getOutPath("src/webview-scripts/ATNGraphRenderer.js", this.context, webview);
        const exportScriptPath = FrontendUtils_1.FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context, webview);
        const graphLibPath = FrontendUtils_1.FrontendUtils.getNodeModulesPath(webview, "d3/dist/d3.js", this.context);
        const name = graphData.ruleName ?? "";
        const nonce = this.generateNonce();
        return `<!DOCTYPE html>
            <html style="width: 100%, height: 100%">
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.generateContentSecurityPolicy(webview, nonce)}
                    ${this.getStyles(webview)}
                    <base target="_blank">
                    <script nonce="${nonce}" src="${graphLibPath}"></script>
                    <script nonce="${nonce}">
                        let atnGraphRenderer;
                        let graphExport;
                    </script>
                </head>
                <body>
                    <div class="header">
                        <span class="atn-graph-color">
                            <span class="graph-initial">Ⓡ</span>ule&nbsp;&nbsp;</span>
                            ${name}
                            <span class="rule-index">(rule index: ${this.currentRuleIndex ?? "?"})</span>
                        <span class="action-box">
                            Reset display <a onClick="atnGraphRenderer.resetTransformation();">
                            <span class="atn-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">↺</span></a>&nbsp;
                            Save to file<a onClick="graphExport.exportToSVG('atn', '${name}');">
                                <span class="atn-graph-save-image" />
                            </a>
                        </span>
                    </div>

                    <svg>
                        <defs>
                            <filter id="white-glow" x="-150%" y="-150%" width="300%" height="300%">
                                <feFlood result="flood" flood-color="#ffffff" flood-opacity="0.15" />
                                <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in" />
                                <feMorphology in="mask" result="dilated" operator="dilate" radius="5" />
                                <feGaussianBlur in="dilated" result="blurred" stdDeviation="5" />
                                <feMerge>
                                    <feMergeNode in="blurred" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            <filter id="black-glow" x="-1000%" y="-1000%" width="2000%" height="2000%">
                                <feFlood result="flood" flood-color="#000000" flood-opacity="0.15" />
                                <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in" />
                                <feMorphology in="mask" result="dilated" operator="dilate" radius="4" />
                                <feGaussianBlur in="dilated" result="blurred" stdDeviation="5" />
                                <feMerge>
                                    <feMergeNode in="blurred" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            <marker id="transitionEndCircle" viewBox="0 -5 10 10" refX="31" refY="0" markerWidth="7"
                                markerHeight="7" orient="auto" class="marker">
                                <path d="M0,-4L10,0L0,4" />
                            </marker>
                            <marker id="transitionEndRect" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="7"
                                markerHeight="7" orient="auto" class="marker">
                                <path d="M0,-4L10,0L0,4" />
                            </marker>
                        </defs>
                    </svg>

                    <script nonce="${nonce}" type="module">
                        import { ATNGraphRenderer } from "${rendererScriptPath}";
                        import { GraphExport, vscode } from "${exportScriptPath}";

                        graphExport = new GraphExport();
                        atnGraphRenderer = new ATNGraphRenderer(vscode);
                        atnGraphRenderer.render(${JSON.stringify(graphData)});
                    </script>
                </body>
            </html>
        `;
    }
    update(editor, forced = false) {
        const caret = editor.selection.active;
        const [selectedRule, selectedRuleIndex] = this.backend.ruleFromPosition(editor.document.fileName, caret.character, caret.line + 1);
        if (this.currentRule !== selectedRule || forced) {
            this.currentRule = selectedRule;
            this.currentRuleIndex = selectedRuleIndex;
            super.update(editor);
        }
    }
    handleMessage(message) {
        const saveMessage = message;
        if (saveMessage.command === "saveATNState") {
            const hash = FrontendUtils_1.FrontendUtils.hashForPath(saveMessage.uri.fsPath);
            const basePath = path.dirname(saveMessage.uri.fsPath);
            const atnCachePath = path.join(basePath, ".antlr/cache");
            let fileEntry = ATNGraphProvider.cachedATNTransformations[hash];
            if (!fileEntry) {
                fileEntry = {};
            }
            const { x: translateX, y: translateY, k: scale } = saveMessage.transform;
            const ruleEntry = {
                scale,
                translation: { x: translateX / scale, y: translateY / scale },
                statePositions: {},
            };
            for (const node of saveMessage.nodes) {
                ruleEntry.statePositions[node.id] = {
                    fx: node.fx === null ? undefined : node.fx,
                    fy: node.fy === null ? undefined : node.fy,
                };
            }
            fileEntry[saveMessage.rule] = ruleEntry;
            ATNGraphProvider.cachedATNTransformations[hash] = fileEntry;
            fs.ensureDirSync(atnCachePath);
            try {
                fs.writeFileSync(path.join(atnCachePath, hash + ".atn"), JSON.stringify(fileEntry), { encoding: "utf-8" });
            }
            catch (error) {
                void vscode_1.window.showErrorMessage(`Couldn't write ATN state data for: ${saveMessage.uri.fsPath} (${hash})`);
            }
            return true;
        }
        return false;
    }
    updateContent(uri) {
        const graphData = this.prepareRenderData(uri);
        this.sendMessage(uri, {
            command: "updateATNTreeData",
            graphData,
        });
        return true;
    }
    prepareRenderData(uri) {
        const ruleName = this.currentRule ? this.currentRule.replace(/\$/g, "$$") : undefined;
        const configuration = vscode_1.workspace.getConfiguration("antlr4.atn");
        const maxLabelCount = configuration.get("maxLabelCount", 3);
        const hash = FrontendUtils_1.FrontendUtils.hashForPath(uri.fsPath);
        const fileTransformations = ATNGraphProvider.cachedATNTransformations[hash] ?? {};
        let initialScale = 0.5;
        let initialTranslation = {};
        const setPosition = (node, position) => {
            const fx = position?.fx;
            const fy = position?.fy;
            switch (node.type) {
                case atn_1.ATNStateType.RULE_START: {
                    node.fy = fy ?? 0;
                    if (fx !== undefined) {
                        node.fx = fx;
                    }
                    else {
                        node.x = -1000;
                    }
                    break;
                }
                case atn_1.ATNStateType.RULE_STOP: {
                    node.fy = fy ?? 0;
                    if (fx !== undefined) {
                        node.fx = fx;
                    }
                    else {
                        node.x = 1000;
                    }
                    break;
                }
                default: {
                    node.fx = position?.fx;
                    node.fy = position?.fy;
                    break;
                }
            }
        };
        let graphData;
        if (ruleName) {
            try {
                graphData = this.backend.getATNGraph(uri.fsPath, ruleName);
                if (graphData) {
                    const ruleTransformation = fileTransformations[ruleName];
                    if (ruleTransformation) {
                        initialScale = ruleTransformation.scale;
                        initialTranslation = ruleTransformation.translation;
                        for (const node of graphData.nodes) {
                            setPosition(node, ruleTransformation.statePositions[node.id]);
                        }
                    }
                    else {
                        for (const node of graphData.nodes) {
                            setPosition(node);
                        }
                    }
                }
            }
            catch (e) {
            }
        }
        const result = {
            uri,
            ruleName,
            maxLabelCount,
            graphData,
            initialScale,
            initialTranslation,
        };
        return result;
    }
}
exports.ATNGraphProvider = ATNGraphProvider;
//# sourceMappingURL=ATNGraphProvider.js.map
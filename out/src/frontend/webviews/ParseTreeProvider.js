"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseTreeProvider = void 0;
const path_1 = require("path");
const vscode_1 = require("vscode");
const WebviewProvider_1 = require("./WebviewProvider");
const FrontendUtils_1 = require("../FrontendUtils");
class ParseTreeProvider extends WebviewProvider_1.WebviewProvider {
    debugger;
    debuggerStopped(uri) {
        this.updateContent(uri);
    }
    generateContent(webview, uri, _options) {
        const graph = this.debugger.currentParseTree;
        const rendererScriptPath = FrontendUtils_1.FrontendUtils.getOutPath("src/webview-scripts/ParseTreeRenderer.js", this.context, webview);
        const exportScriptPath = FrontendUtils_1.FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context, webview);
        const graphLibPath = FrontendUtils_1.FrontendUtils.getNodeModulesPath(webview, "d3/dist/d3.js", this.context);
        const settings = vscode_1.workspace.getConfiguration("antlr4.debug");
        const horizontal = settings.get("visualParseTreeHorizontal", true);
        const clustered = settings.get("visualParseTreeClustered", false);
        const nonce = this.generateNonce();
        const diagram = `<!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.generateContentSecurityPolicy(webview, nonce)}
                    ${this.getStyles(webview)}
                    <base target="_blank">
                    <script nonce="${nonce}" src="${graphLibPath}"></script>
                    <script nonce="${nonce}">
                        let parseTreeRenderer;
                        let graphExport;
                    </script>
                </head>

            <body>
                <div class="header"><span class="parse-tree-color"><span class="graph-initial">Ⓟ</span>arse Tree</span>
                    <span class="action-box">
                        Tree
                        <span class="switch">
                            <span class="switch-border">
                                <input id="switch1" type="checkbox" onClick="parseTreeRenderer.toggleTreeType(this)"/>
                                <label for="switch1"></label>
                                <span class="switch-handle-top"></span>
                            </span>
                        </span>
                        Cluster&nbsp;&nbsp;
                        Horizontal
                        <span class="switch">
                            <span class="switch-border">
                                <input id="switch2" type="checkbox"
                                    onClick="parseTreeRenderer.toggleOrientation(this)"/>
                                <label for="switch2"></label>
                                <span class="switch-handle-top"></span>
                            </span>
                        </span>
                        Vertical&nbsp;&nbsp;
                        <a onClick="parseTreeRenderer.changeNodeSize(0.9);">
                            <span class="parse-tree-color" style="font-size: 120%; font-weight: 800;
                                cursor: pointer; vertical-align: middle;">-</span>
                        </a>
                        Node Size
                        <a onClick="parseTreeRenderer.changeNodeSize(1.1);">
                            <span class="parse-tree-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">+</span>
                        </a>&nbsp;&nbsp;
                        Save to SVG
                        <a onClick="graphExport.exportToSVG('parse-tree', '${(0, path_1.basename)(uri.fsPath)}');">
                            <span class="parse-tree-save-image" />
                        </a>
                    </span>
                </div>

                <svg></svg>
                <script nonce="${nonce}" type="module">
                    import { ParseTreeRenderer } from "${rendererScriptPath}";
                    import { GraphExport } from "${exportScriptPath}";

                    // Register a listener for data changes.
                    window.addEventListener("message", (event) => {
                        switch (event.data.command) {
                            case "updateParseTreeData": {
                                parseTreeRenderer.loadNewTree({ parseTreeData: event.data.treeData });

                                break;
                            }

                            default:
                        }
                    });

                    parseTreeRenderer = new ParseTreeRenderer();
                    graphExport = new GraphExport();

                    parseTreeRenderer.loadNewTree({
                        parseTreeData: ${JSON.stringify(graph)},
                        useCluster: ${clustered.toString()},
                        horizontal: ${horizontal.toString()},
                        width: 1000,
                        height: 1000,
                        initialScale: 0.75,
                        initialTranslateX: ${horizontal ? 200 : 500},
                        initialTranslateY: ${horizontal ? 400 : 50},
                    });
                    parseTreeRenderer.initSwitches();
                </script>
            </body>
        </html>`;
        return diagram;
    }
    updateContent(uri) {
        const graph = this.debugger.currentParseTree;
        this.sendMessage(uri, {
            command: "updateParseTreeData",
            treeData: graph,
        });
        return true;
    }
}
exports.ParseTreeProvider = ParseTreeProvider;
//# sourceMappingURL=ParseTreeProvider.js.map
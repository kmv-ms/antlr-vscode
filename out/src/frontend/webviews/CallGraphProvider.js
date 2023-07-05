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
exports.CallGraphProvider = void 0;
const path = __importStar(require("path"));
const WebviewProvider_1 = require("./WebviewProvider");
const FrontendUtils_1 = require("../FrontendUtils");
class CallGraphProvider extends WebviewProvider_1.WebviewProvider {
    generateContent(webview, uri) {
        const fileName = uri.fsPath;
        const baseName = path.basename(fileName, path.extname(fileName));
        const graph = this.backend.getReferenceGraph(fileName);
        const data = [];
        for (const entry of graph) {
            const references = [];
            for (const ref of entry[1].rules) {
                references.push(ref);
            }
            for (const ref of entry[1].tokens) {
                references.push(ref);
            }
            data.push({ name: entry[0], references });
        }
        const rendererScriptPath = FrontendUtils_1.FrontendUtils.getOutPath("src/webview-scripts/CallGraphRenderer.js", this.context, webview);
        const exportScriptPath = FrontendUtils_1.FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context, webview);
        const graphLibPath = FrontendUtils_1.FrontendUtils.getNodeModulesPath(webview, "d3/dist/d3.js", this.context);
        const nonce = this.generateNonce();
        const diagram = `<!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8"/>
                    ${this.generateContentSecurityPolicy(webview, nonce)}
                    ${this.getStyles(webview)}
                    <base href="${uri.toString(true)}">
                    <script nonce="${nonce}" src="${graphLibPath}"></script>
                    <script nonce="${nonce}">
                        let callGraphRenderer;
                        let graphExport;
                    </script>
                </head>

            <body>
                <div class="header"><span class="call-graph-color"><span class="graph-initial">Ⓒ</span>all Graph</span>
                    <span class="action-box">
                        <a onClick="callGraphRenderer.changeDiameter(0.8);">
                            <span class="call-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">-</span>
                        </a>
                        <span style="margin-left: -5px; margin-right: -5px; cursor: default;">Change radius</span>
                        <a onClick="callGraphRenderer.changeDiameter(1.2);">
                            <span class="call-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">+</span>
                        </a>&nbsp;
                        Save to SVG
                        <a onClick="graphExport.exportToSVG('call-graph', '${baseName}');">
                            <span class="call-graph-save-image" />
                        </a>
                    </span>
                </div>

                <div id="container">
                    <svg></svg>
                </div>
                <script nonce="${nonce}" type="module">
                    import { CallGraphRenderer } from "${rendererScriptPath}";
                    import { GraphExport } from "${exportScriptPath}";

                    const data = ${JSON.stringify(data)};
                    callGraphRenderer = new CallGraphRenderer(data);
                    graphExport = new GraphExport();

                    callGraphRenderer.render();
                </script>

            </body>
        </html>`;
        return diagram;
    }
}
exports.CallGraphProvider = CallGraphProvider;
//# sourceMappingURL=CallGraphProvider.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RailroadDiagramProvider = void 0;
const path_1 = require("path");
const types_1 = require("../../backend/types");
const WebviewProvider_1 = require("./WebviewProvider");
const FrontendUtils_1 = require("../FrontendUtils");
class RailroadDiagramProvider extends WebviewProvider_1.WebviewProvider {
    generateContent(webview, uri, options) {
        const fileName = uri.fsPath;
        const baseName = (0, path_1.basename)(fileName, (0, path_1.extname)(fileName));
        const nonce = this.generateNonce();
        const scripts = [
            FrontendUtils_1.FrontendUtils.getMiscPath("railroad-diagrams.js", this.context, webview),
        ];
        const exportScriptPath = FrontendUtils_1.FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context, webview);
        if (!this.currentRule || this.currentRuleIndex === undefined) {
            return `<!DOCTYPE html>
                <html>
                    <head>
                        ${this.generateContentSecurityPolicy(webview, nonce)}
                    </head>
                    <body><span style="color: #808080; font-size: 16pt;">No rule selected</span></body>
                </html>`;
        }
        let diagram = `<!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-type" content="text/html; charset=UTF-8"/>
                ${this.generateContentSecurityPolicy(webview, nonce)}
                ${this.getStyles(webview)}
                <base href="${uri.toString(true)}">
                <script nonce="${nonce}">
                    let graphExport;
                </script>
            </head>

            <body>
            ${this.getScripts(nonce, scripts)}`;
        if (options.fullList) {
            diagram += `
                <div class="header">
                    <span class="rrd-color"><span class="graph-initial">Ⓡ</span>rd&nbsp;&nbsp;</span>All rules
                    <span class="action-box">
                        Save to HTML<a onClick="graphExport.exportToHTML('rrd', '${baseName}');">
                            <span class="rrd-save-image" />
                        </a>
                    </span>
                </div>
                <div id="container">`;
            const symbols = this.backend.listTopLevelSymbols(fileName, false);
            for (const symbol of symbols) {
                if (symbol.kind === types_1.SymbolKind.LexerRule
                    || symbol.kind === types_1.SymbolKind.ParserRule
                    || symbol.kind === types_1.SymbolKind.FragmentLexerToken) {
                    const script = this.backend.getRRDScript(fileName, symbol.name);
                    diagram += `<h3 class="${symbol.name}-class">${symbol.name}</h3>
                        <script nonce="${nonce}">${script}</script>`;
                }
            }
            diagram += "</div>";
        }
        else {
            diagram += `
                <div class="header">
                    <span class="rrd-color">
                        <span class="graph-initial">Ⓡ</span>ule&nbsp;&nbsp;
                    </span>
                        &nbsp;&nbsp;${this.currentRule} <span class="rule-index">(rule index: ${this.currentRuleIndex})
                    </span>
                    <span class="action-box">
                        Save to SVG
                        <a onClick="graphExport.exportToSVG('rrd', '${this.currentRule}');">
                            <span class="rrd-save-image" />
                        </a>
                    </span>
                </div>
                <div id="container">
                    <script nonce="${nonce}" >${this.backend.getRRDScript(fileName, this.currentRule)}</script>
                </div>`;
        }
        diagram += `
            <script nonce="${nonce}" type="module">
                import { GraphExport } from "${exportScriptPath}";

                graphExport = new GraphExport();
            </script>
        </body></html>`;
        return diagram;
    }
    update(editor, forced = false) {
        const caret = editor.selection.active;
        const [rule, index] = this.backend.ruleFromPosition(editor.document.fileName, caret.character, caret.line + 1);
        if (!rule || index === undefined) {
            super.update(editor);
            return;
        }
        if (this.currentRule !== rule || this.currentRuleIndex !== index || forced) {
            this.currentRule = rule;
            this.currentRuleIndex = index;
            super.update(editor);
        }
    }
}
exports.RailroadDiagramProvider = RailroadDiagramProvider;
//# sourceMappingURL=RailroadDiagramProvider.js.map
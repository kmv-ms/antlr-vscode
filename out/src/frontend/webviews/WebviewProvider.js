"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewProvider = void 0;
const path_1 = require("path");
const vscode_1 = require("vscode");
const FrontendUtils_1 = require("../FrontendUtils");
class WebviewProvider {
    backend;
    context;
    currentRule;
    currentRuleIndex;
    webViewMap = new Map();
    constructor(backend, context) {
        this.backend = backend;
        this.context = context;
    }
    showWebview(uri, options) {
        const uriString = uri.toString();
        if (this.webViewMap.has(uriString)) {
            const [existingPanel] = this.webViewMap.get(uriString);
            existingPanel.title = options.title;
            if (!this.updateContent(uri)) {
                existingPanel.webview.html = this.generateContent(existingPanel.webview, uri, options);
            }
            return;
        }
        const panel = vscode_1.window.createWebviewPanel("antlr4-vscode-webview", options.title, vscode_1.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        this.webViewMap.set(uriString, [panel, options]);
        panel.onDidDispose(() => {
            this.webViewMap.delete(uriString);
        });
        panel.webview.html = this.generateContent(panel.webview, uri, options);
        panel.webview.onDidReceiveMessage((message) => {
            if (this.handleMessage(message)) {
                return;
            }
            switch (message.command) {
                case "alert": {
                    if (typeof message.text === "string") {
                        void vscode_1.window.showErrorMessage(message.text);
                    }
                    else {
                        void vscode_1.window.showErrorMessage(String(message));
                    }
                    return;
                }
                case "saveSVG": {
                    if (typeof message.svg === "string" && typeof message.name === "string") {
                        const css = [];
                        css.push(FrontendUtils_1.FrontendUtils.getMiscPath("light.css", this.context));
                        const customStyles = vscode_1.workspace.getConfiguration("antlr4").customCSS;
                        if (customStyles && Array.isArray(customStyles)) {
                            for (const style of customStyles) {
                                css.push(style);
                            }
                        }
                        let svg = '<?xml version="1.0" standalone="no"?>\n';
                        for (const stylesheet of css) {
                            svg += `<?xml-stylesheet href="${(0, path_1.basename)(stylesheet)}" type="text/css"?>\n`;
                        }
                        svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
                            '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' + message.svg;
                        try {
                            if (typeof message.type === "string") {
                                const section = "antlr4." + message.type;
                                const saveDir = vscode_1.workspace.getConfiguration(section).saveDir ?? "";
                                const target = (0, path_1.join)(saveDir, message.name + "." + message.type);
                                FrontendUtils_1.FrontendUtils.exportDataWithConfirmation(target, { "Scalable Vector Graphic": ["svg"] }, svg, css);
                            }
                        }
                        catch (error) {
                            void vscode_1.window.showErrorMessage("Couldn't write SVG file: " + String(error));
                        }
                    }
                    break;
                }
                case "saveHTML": {
                    if (typeof message.type === "string" && typeof message.name === "string") {
                        const css = [];
                        css.push(FrontendUtils_1.FrontendUtils.getMiscPath("light.css", this.context));
                        css.push(FrontendUtils_1.FrontendUtils.getMiscPath("dark.css", this.context));
                        const customStyles = vscode_1.workspace.getConfiguration("antlr4").customCSS;
                        if (customStyles && Array.isArray(customStyles)) {
                            for (const style of customStyles) {
                                css.push(style);
                            }
                        }
                        try {
                            const section = "antlr4." + message.type;
                            const saveDir = vscode_1.workspace.getConfiguration(section).saveDir ?? "";
                            const target = (0, path_1.join)(saveDir, message.name + "." + message.type);
                            FrontendUtils_1.FrontendUtils.exportDataWithConfirmation(target, { HTML: ["html"] }, message.html, css);
                        }
                        catch (error) {
                            void vscode_1.window.showErrorMessage("Couldn't write HTML file: " + String(error));
                        }
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        }, undefined, this.context.subscriptions);
    }
    update(editor) {
        if (this.webViewMap.has(editor.document.uri.toString())) {
            const [panel, options] = this.webViewMap.get(editor.document.uri.toString());
            if (!this.updateContent(editor.document.uri)) {
                panel.webview.html = this.generateContent(panel.webview, editor.document.uri, options);
            }
        }
    }
    generateContent(_webview, _source, _options) {
        return "";
    }
    generateContentSecurityPolicy(webview, nonce) {
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none';
            script-src 'nonce-${nonce}';
            script-src-attr 'unsafe-inline';
            style-src ${webview.cspSource} 'self' 'unsafe-inline';
            img-src ${webview.cspSource} 'self' "/>
        `;
    }
    updateContent(_uri) {
        return false;
    }
    sendMessage(uri, args) {
        if (this.webViewMap.has(uri.toString())) {
            const [panel] = this.webViewMap.get(uri.toString());
            void panel.webview.postMessage(args);
            return true;
        }
        return false;
    }
    handleMessage(_message) {
        return false;
    }
    getStyles(webView) {
        const baseStyles = [
            FrontendUtils_1.FrontendUtils.getMiscPath("light.css", this.context, webView),
            FrontendUtils_1.FrontendUtils.getMiscPath("dark.css", this.context, webView),
        ];
        const defaults = baseStyles.map((link) => {
            return `<link rel="stylesheet" type="text/css" href="${link}">`;
        }).join("\n");
        const paths = vscode_1.workspace.getConfiguration("antlr4").customCSS;
        if (paths && Array.isArray(paths) && paths.length > 0) {
            return defaults + "\n" + paths.map((stylePath) => {
                return `<link rel="stylesheet" href="${webView.asWebviewUri(vscode_1.Uri.parse(stylePath)).toString()}" ` +
                    "type=\"text/css\" media=\"screen\">";
            }).join("\n");
        }
        return defaults;
    }
    getScripts(nonce, scripts) {
        return scripts.map((source) => {
            return `<script type="text/javascript" src="${source}" nonce="${nonce}"></script>`;
        }).join("\n");
    }
    generateNonce() {
        return `${new Date().getTime()}${new Date().getMilliseconds()}`;
    }
}
exports.WebviewProvider = WebviewProvider;
//# sourceMappingURL=WebviewProvider.js.map
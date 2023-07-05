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
exports.AntlrDebugConfigurationProvider = void 0;
const Net = __importStar(require("net"));
const vscode_1 = require("vscode");
const AntlrDebugAdapter_1 = require("./frontend/AntlrDebugAdapter");
class AntlrDebugConfigurationProvider {
    backend;
    parseTreeProvider;
    server;
    constructor(backend, parseTreeProvider) {
        this.backend = backend;
        this.parseTreeProvider = parseTreeProvider;
    }
    resolveDebugConfiguration(folder, config, _token) {
        if (vscode_1.workspace.getConfiguration("antlr4.generation").mode === "none") {
            void vscode_1.window.showErrorMessage("Interpreter data generation is disabled in the preferences (see " +
                "'antlr4.generation'). Set this at least to 'internal' to enable debugging.");
            return null;
        }
        if (!this.server) {
            this.server = Net.createServer((socket) => {
                socket.on("end", () => {
                });
                const session = new AntlrDebugAdapter_1.AntlrDebugSession(folder, this.backend, [this.parseTreeProvider]);
                session.setRunAsServer(true);
                session.start(socket, socket);
            }).listen(0);
        }
        const info = this.server.address();
        if (info) {
            config.debugServer = info.port;
        }
        else {
            config.debugServer = 0;
        }
        return config;
    }
    dispose() {
        if (this.server) {
            this.server.close();
        }
    }
}
exports.AntlrDebugConfigurationProvider = AntlrDebugConfigurationProvider;
//# sourceMappingURL=AntlrDebugConfigurationProvider.js.map
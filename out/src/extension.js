"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const ExtensionHost_1 = require("./ExtensionHost");
let extensionHost;
const activate = (context) => {
    extensionHost = new ExtensionHost_1.ExtensionHost(context);
};
exports.activate = activate;
//# sourceMappingURL=extension.js.map
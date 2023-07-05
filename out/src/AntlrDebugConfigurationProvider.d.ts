import { CancellationToken, DebugConfiguration, DebugConfigurationProvider, ProviderResult, WorkspaceFolder } from "vscode";
import { AntlrFacade } from "./backend/facade";
import { ParseTreeProvider } from "./frontend/webviews/ParseTreeProvider";
export declare class AntlrDebugConfigurationProvider implements DebugConfigurationProvider {
    private backend;
    private parseTreeProvider;
    private server?;
    constructor(backend: AntlrFacade, parseTreeProvider: ParseTreeProvider);
    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, _token?: CancellationToken): ProviderResult<DebugConfiguration>;
    dispose(): void;
}

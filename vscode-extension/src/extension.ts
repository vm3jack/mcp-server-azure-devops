import * as path from 'path';
import * as vscode from 'vscode';

const PROVIDER_ID = 'azure-devops-mcp';
const SERVER_LABEL = 'Azure DevOps / TFS';

const KEYS = {
  orgUrl: 'adoMcp.orgUrl',
  authMethod: 'adoMcp.authMethod',
  defaultProject: 'adoMcp.defaultProject',
  tlsMode: 'adoMcp.tlsMode',
  pat: 'adoMcp.pat',
};

async function promptConfig(
  context: vscode.ExtensionContext,
): Promise<boolean> {
  // Step 1: Server URL
  const orgUrl = await vscode.window.showInputBox({
    title: 'Azure DevOps / TFS Setup (1/5)',
    prompt: 'TFS / Azure DevOps Server URL',
    placeHolder: 'https://server/tfs/DefaultCollection',
    value: context.globalState.get(KEYS.orgUrl, ''),
    ignoreFocusOut: true,
    validateInput: (v) => (v.trim() ? undefined : 'URL is required'),
  });
  if (orgUrl === undefined) return false;

  // Step 2: Auth method
  const currentAuth = context.globalState.get<string>(KEYS.authMethod) ?? 'pat';
  const authItems = [
    {
      label: 'Personal Access Token (PAT)',
      description: 'Recommended for TFS on-premises',
      value: 'pat',
      picked: currentAuth === 'pat',
    },
    {
      label: 'Azure Identity',
      description: 'Managed Identity / Workload Identity',
      value: 'azure-identity',
      picked: currentAuth === 'azure-identity',
    },
    {
      label: 'Azure CLI',
      description: 'Uses az login credentials',
      value: 'azure-cli',
      picked: currentAuth === 'azure-cli',
    },
  ];
  const authPick = await vscode.window.showQuickPick(authItems, {
    title: 'Azure DevOps / TFS Setup (2/5)',
    placeHolder: 'Select authentication method',
    ignoreFocusOut: true,
  });
  if (!authPick) return false;

  // Step 3: PAT (only if pat auth)
  let pat = '';
  if (authPick.value === 'pat') {
    const patInput = await vscode.window.showInputBox({
      title: 'Azure DevOps / TFS Setup (3/5)',
      prompt: 'Personal Access Token (PAT)',
      password: true,
      ignoreFocusOut: true,
      validateInput: (v) => (v.trim() ? undefined : 'PAT is required'),
    });
    if (patInput === undefined) return false;
    pat = patInput;
  }

  // Step 4: Default project (optional)
  const defaultProject = await vscode.window.showInputBox({
    title: 'Azure DevOps / TFS Setup (4/5)',
    prompt: 'Default project name (optional)',
    placeHolder: 'Press Enter to skip',
    value: context.globalState.get(KEYS.defaultProject, ''),
    ignoreFocusOut: true,
  });
  if (defaultProject === undefined) return false;

  // Step 5: TLS mode
  const currentTls = context.globalState.get<string>(KEYS.tlsMode) ?? '1';
  const tlsItems = [
    {
      label: 'Standard TLS verification',
      description: 'No — default setting',
      value: '1',
      picked: currentTls === '1',
    },
    {
      label: 'Disable TLS verification',
      description: 'Yes — corporate proxy or self-signed certificate',
      value: '0',
      picked: currentTls === '0',
    },
  ];
  const tlsPick = await vscode.window.showQuickPick(tlsItems, {
    title: 'Azure DevOps / TFS Setup (5/5)',
    placeHolder:
      'Are you behind a corporate proxy or using a self-signed SSL certificate?',
    ignoreFocusOut: true,
  });
  if (!tlsPick) return false;

  // Store all values
  await context.globalState.update(KEYS.orgUrl, orgUrl.trim());
  await context.globalState.update(KEYS.authMethod, authPick.value);
  await context.globalState.update(KEYS.defaultProject, defaultProject.trim());
  await context.globalState.update(KEYS.tlsMode, tlsPick.value);
  if (authPick.value === 'pat') {
    await context.secrets.store(KEYS.pat, pat);
  } else {
    await context.secrets.delete(KEYS.pat);
  }

  return true;
}

export function activate(context: vscode.ExtensionContext) {
  const didChangeEmitter = new vscode.EventEmitter<void>();

  // Register reconfigure command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'azure-devops-mcp.reconfigure',
      async () => {
        const ok = await promptConfig(context);
        if (ok) {
          didChangeEmitter.fire(); // restart MCP server with new config
          vscode.window.showInformationMessage(
            'Azure DevOps MCP: Configuration updated, server restarting...',
          );
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider(PROVIDER_ID, {
      onDidChangeMcpServerDefinitions: didChangeEmitter.event,

      async provideMcpServerDefinitions() {
        const serverPath = context.asAbsolutePath(
          path.join('out', 'server.js'),
        );
        return [
          new vscode.McpStdioServerDefinition(SERVER_LABEL, process.execPath, [
            serverPath,
          ]),
        ];
      },

      async resolveMcpServerDefinition(server: vscode.McpServerDefinition) {
        const orgUrl = context.globalState.get<string>(KEYS.orgUrl);
        const authMethod = context.globalState.get<string>(KEYS.authMethod);

        // First time setup
        if (!orgUrl || !authMethod) {
          const ok = await promptConfig(context);
          if (!ok) return undefined;
        }

        const resolvedOrgUrl = context.globalState.get<string>(KEYS.orgUrl, '');
        const resolvedAuthMethod = context.globalState.get<string>(
          KEYS.authMethod,
          'pat',
        );
        const resolvedDefaultProject = context.globalState.get<string>(
          KEYS.defaultProject,
          '',
        );
        const resolvedTlsMode = context.globalState.get<string>(
          KEYS.tlsMode,
          '1',
        );
        const resolvedPat = (await context.secrets.get(KEYS.pat)) ?? '';

        const serverPath = context.asAbsolutePath(
          path.join('out', 'server.js'),
        );
        return new vscode.McpStdioServerDefinition(
          server.label,
          process.execPath,
          [serverPath],
          {
            AZURE_DEVOPS_ORG_URL: resolvedOrgUrl,
            AZURE_DEVOPS_AUTH_METHOD: resolvedAuthMethod,
            AZURE_DEVOPS_PAT: resolvedPat,
            AZURE_DEVOPS_DEFAULT_PROJECT: resolvedDefaultProject,
            NODE_TLS_REJECT_UNAUTHORIZED: resolvedTlsMode,
          },
        );
      },
    }),
  );
}

export function deactivate() {}

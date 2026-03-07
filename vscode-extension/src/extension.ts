import * as path from 'path';
import * as vscode from 'vscode';

const PROVIDER_ID = 'azure-devops-mcp';
const SERVER_LABEL = 'Azure DevOps / TFS';

async function promptConfig(): Promise<boolean> {
  const cfg = vscode.workspace.getConfiguration('adoMcp');

  const orgUrl = await vscode.window.showInputBox({
    title: 'Azure DevOps / TFS Setup (1/5)',
    prompt: 'TFS / Azure DevOps Server URL',
    placeHolder: 'https://server/tfs/DefaultCollection',
    value: cfg.get<string>('orgUrl', ''),
    ignoreFocusOut: true,
    validateInput: (v) => (v.trim() ? undefined : 'URL is required'),
  });
  if (orgUrl === undefined) return false;

  const authItems = [
    {
      label: 'Personal Access Token (PAT)',
      description: 'Recommended for TFS on-premises',
      value: 'pat',
      picked: cfg.get<string>('authMethod', 'pat') === 'pat',
    },
    {
      label: 'Azure Identity',
      description: 'Managed Identity / Workload Identity',
      value: 'azure-identity',
      picked: cfg.get<string>('authMethod') === 'azure-identity',
    },
    {
      label: 'Azure CLI',
      description: 'Uses az login credentials',
      value: 'azure-cli',
      picked: cfg.get<string>('authMethod') === 'azure-cli',
    },
  ];
  const authPick = await vscode.window.showQuickPick(authItems, {
    title: 'Azure DevOps / TFS Setup (2/5)',
    placeHolder: 'Select authentication method',
    ignoreFocusOut: true,
  });
  if (!authPick) return false;

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

  const defaultProject = await vscode.window.showInputBox({
    title: 'Azure DevOps / TFS Setup (4/5)',
    prompt: 'Default project name (optional)',
    placeHolder: 'Press Enter to skip',
    value: cfg.get<string>('defaultProject', ''),
    ignoreFocusOut: true,
  });
  if (defaultProject === undefined) return false;

  const currentTls = cfg.get<string>('tlsMode', '1');
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

  await cfg.update('orgUrl', orgUrl.trim(), vscode.ConfigurationTarget.Global);
  await cfg.update(
    'authMethod',
    authPick.value,
    vscode.ConfigurationTarget.Global,
  );
  if (authPick.value === 'pat') {
    await cfg.update('pat', pat, vscode.ConfigurationTarget.Global);
  }
  await cfg.update(
    'defaultProject',
    defaultProject.trim(),
    vscode.ConfigurationTarget.Global,
  );
  await cfg.update('tlsMode', tlsPick.value, vscode.ConfigurationTarget.Global);

  return true;
}

export function activate(context: vscode.ExtensionContext) {
  const didChangeEmitter = new vscode.EventEmitter<void>();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'azure-devops-mcp.reconfigure',
      async () => {
        const ok = await promptConfig();
        if (ok) {
          vscode.window.showInformationMessage(
            'Azure DevOps MCP: Configuration updated, server restarting...',
          );
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('adoMcp')) {
        didChangeEmitter.fire();
      }
    }),
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
        const cfg = vscode.workspace.getConfiguration('adoMcp');
        const orgUrl = cfg.get<string>('orgUrl', '');

        if (!orgUrl) {
          const ok = await promptConfig();
          if (!ok) return undefined;
        }

        const resolved = vscode.workspace.getConfiguration('adoMcp');
        return new vscode.McpStdioServerDefinition(
          server.label,
          process.execPath,
          [context.asAbsolutePath(path.join('out', 'server.js'))],
          {
            AZURE_DEVOPS_ORG_URL: resolved.get<string>('orgUrl', ''),
            AZURE_DEVOPS_AUTH_METHOD: resolved.get<string>('authMethod', 'pat'),
            AZURE_DEVOPS_PAT: resolved.get<string>('pat', ''),
            AZURE_DEVOPS_DEFAULT_PROJECT: resolved.get<string>(
              'defaultProject',
              '',
            ),
            NODE_TLS_REJECT_UNAUTHORIZED: resolved.get<string>('tlsMode', '1'),
          },
        );
      },
    }),
  );

  context.subscriptions.push(didChangeEmitter);
}

export function deactivate() {}

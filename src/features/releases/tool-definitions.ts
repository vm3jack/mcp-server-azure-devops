import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolDefinition } from '../../shared/types/tool-definition';
import { ListReleaseDefinitionsSchema } from './list-release-definitions/schema';
import { GetReleaseDefinitionSchema } from './get-release-definition/schema';
import { ListReleasesSchema } from './list-releases/schema';
import { GetReleaseSchema } from './get-release/schema';
import { CreateReleaseSchema } from './create-release/schema';
import { DeployReleaseStageSchema } from './deploy-release-stage/schema';

export const releasesTools: ToolDefinition[] = [
  {
    name: 'list_release_definitions',
    description: 'List classic release definitions (CD pipelines) in a project',
    inputSchema: zodToJsonSchema(ListReleaseDefinitionsSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_release_definition',
    description:
      'Get details of a specific classic release definition, including environments, artifacts, and triggers',
    inputSchema: zodToJsonSchema(GetReleaseDefinitionSchema),
    mcp_enabled: true,
  },
  {
    name: 'list_releases',
    description:
      'List release instances for a project, optionally filtered by definition',
    inputSchema: zodToJsonSchema(ListReleasesSchema),
    mcp_enabled: true,
  },
  {
    name: 'get_release',
    description:
      'Get details of a specific release instance, including environment deployment status',
    inputSchema: zodToJsonSchema(GetReleaseSchema),
    mcp_enabled: true,
  },
  {
    name: 'create_release',
    description: 'Create a new release from a classic release definition',
    inputSchema: zodToJsonSchema(CreateReleaseSchema),
    mcp_enabled: true,
  },
  {
    name: 'deploy_release_stage',
    description:
      'Trigger deployment of a specific stage (environment) in an existing release. Use get_release to find the environmentId.',
    inputSchema: zodToJsonSchema(DeployReleaseStageSchema),
    mcp_enabled: true,
  },
];

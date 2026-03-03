// Re-export types
export * from './types';

// Re-export features
export * from './list-release-definitions';
export * from './get-release-definition';
export * from './list-releases';
export * from './get-release';
export * from './create-release';
export * from './deploy-release-stage';

// Export tool definitions
export * from './tool-definitions';

import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { WebApi } from 'azure-devops-node-api';
import {
  RequestIdentifier,
  RequestHandler,
} from '../../shared/types/request-handler';
import { ListReleaseDefinitionsSchema } from './list-release-definitions';
import { GetReleaseDefinitionSchema } from './get-release-definition';
import { ListReleasesSchema } from './list-releases';
import { GetReleaseSchema } from './get-release';
import { CreateReleaseSchema } from './create-release';
import { DeployReleaseStageSchema } from './deploy-release-stage';
import { listReleaseDefinitions } from './list-release-definitions';
import { getReleaseDefinition } from './get-release-definition';
import { listReleases } from './list-releases';
import { getRelease } from './get-release';
import { createRelease } from './create-release';
import { deployReleaseStage } from './deploy-release-stage';
import { defaultProject } from '../../utils/environment';

export const isReleasesRequest: RequestIdentifier = (
  request: CallToolRequest,
): boolean => {
  const toolName = request.params.name;
  return [
    'list_release_definitions',
    'get_release_definition',
    'list_releases',
    'get_release',
    'create_release',
    'deploy_release_stage',
  ].includes(toolName);
};

export const handleReleasesRequest: RequestHandler = async (
  connection: WebApi,
  request: CallToolRequest,
): Promise<{ content: Array<{ type: string; text: string }> }> => {
  switch (request.params.name) {
    case 'list_release_definitions': {
      const args = ListReleaseDefinitionsSchema.parse(request.params.arguments);
      const result = await listReleaseDefinitions(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_release_definition': {
      const args = GetReleaseDefinitionSchema.parse(request.params.arguments);
      const result = await getReleaseDefinition(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'list_releases': {
      const args = ListReleasesSchema.parse(request.params.arguments);
      const result = await listReleases(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_release': {
      const args = GetReleaseSchema.parse(request.params.arguments);
      const result = await getRelease(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'create_release': {
      const args = CreateReleaseSchema.parse(request.params.arguments);
      const result = await createRelease(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'deploy_release_stage': {
      const args = DeployReleaseStageSchema.parse(request.params.arguments);
      const result = await deployReleaseStage(connection, {
        ...args,
        projectId: args.projectId ?? defaultProject,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    default:
      throw new Error(`Unknown releases tool: ${request.params.name}`);
  }
};

import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { GetReleaseDefinitionOptions, ReleaseDefinition } from '../types';

export async function getReleaseDefinition(
  connection: WebApi,
  options: GetReleaseDefinitionOptions,
): Promise<ReleaseDefinition> {
  try {
    const releaseApi = await connection.getReleaseApi();
    const { projectId, definitionId } = options;

    const definition = await releaseApi.getReleaseDefinition(
      projectId,
      definitionId,
    );

    if (!definition) {
      throw new AzureDevOpsResourceNotFoundError(
        `Release definition ${definitionId} not found in project ${projectId}`,
      );
    }

    return definition;
  } catch (error) {
    if (error instanceof AzureDevOpsError) {
      throw error;
    }

    if (error instanceof Error) {
      if (
        error.message.includes('Authentication') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('401')
      ) {
        throw new AzureDevOpsAuthenticationError(
          `Failed to authenticate: ${error.message}`,
        );
      }

      if (
        error.message.includes('not found') ||
        error.message.includes('does not exist') ||
        error.message.includes('404')
      ) {
        throw new AzureDevOpsResourceNotFoundError(
          `Release definition ${options.definitionId} not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get release definition: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

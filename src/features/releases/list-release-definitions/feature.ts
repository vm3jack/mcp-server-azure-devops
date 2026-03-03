import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { ListReleaseDefinitionsOptions, ReleaseDefinition } from '../types';

export async function listReleaseDefinitions(
  connection: WebApi,
  options: ListReleaseDefinitionsOptions,
): Promise<ReleaseDefinition[]> {
  try {
    const releaseApi = await connection.getReleaseApi();
    const { projectId, searchText, top, path } = options;

    const definitions = await releaseApi.getReleaseDefinitions(
      projectId,
      searchText,
      undefined,
      undefined,
      undefined,
      top,
      undefined,
      undefined,
      path,
    );

    return definitions;
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
          `Project or resource not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to list release definitions: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

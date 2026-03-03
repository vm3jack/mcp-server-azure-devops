import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { ListReleasesOptions, Release } from '../types';

export async function listReleases(
  connection: WebApi,
  options: ListReleasesOptions,
): Promise<Release[]> {
  try {
    const releaseApi = await connection.getReleaseApi();
    const {
      projectId,
      definitionId,
      searchText,
      top,
      createdBy,
      minCreatedTime,
      maxCreatedTime,
    } = options;

    const releases = await releaseApi.getReleases(
      projectId,
      definitionId,
      undefined,
      searchText,
      createdBy,
      undefined,
      undefined,
      minCreatedTime ? new Date(minCreatedTime) : undefined,
      maxCreatedTime ? new Date(maxCreatedTime) : undefined,
      undefined,
      top,
    );

    return releases;
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
      `Failed to list releases: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

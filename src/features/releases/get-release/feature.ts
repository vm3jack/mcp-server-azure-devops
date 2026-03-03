import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { GetReleaseOptions, Release } from '../types';

export async function getRelease(
  connection: WebApi,
  options: GetReleaseOptions,
): Promise<Release> {
  try {
    const releaseApi = await connection.getReleaseApi();
    const { projectId, releaseId } = options;

    const release = await releaseApi.getRelease(projectId, releaseId);

    if (!release) {
      throw new AzureDevOpsResourceNotFoundError(
        `Release ${releaseId} not found in project ${projectId}`,
      );
    }

    return release;
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
          `Release ${options.releaseId} not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to get release: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

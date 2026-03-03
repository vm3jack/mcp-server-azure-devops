import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { CreateReleaseOptions, Release } from '../types';

export async function createRelease(
  connection: WebApi,
  options: CreateReleaseOptions,
): Promise<Release> {
  try {
    const releaseApi = await connection.getReleaseApi();
    const {
      projectId,
      definitionId,
      description,
      artifactAlias,
      artifactVersion,
    } = options;

    const releaseStartMetadata = {
      definitionId,
      description,
      artifacts:
        artifactAlias && artifactVersion
          ? [
              {
                alias: artifactAlias,
                instanceReference: {
                  id: artifactVersion,
                  name: artifactVersion,
                },
              },
            ]
          : [],
      isDraft: false,
      manualEnvironments: [],
    };

    const release = await releaseApi.createRelease(
      releaseStartMetadata,
      projectId,
    );

    if (!release) {
      throw new AzureDevOpsError(
        `Failed to create release from definition ${definitionId}`,
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
          `Release definition ${options.definitionId} not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to create release: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

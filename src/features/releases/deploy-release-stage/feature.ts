import { WebApi } from 'azure-devops-node-api';
import { EnvironmentStatus } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { ReleaseEnvironment } from '../types';

export interface DeployReleaseStageOptions {
  projectId: string;
  releaseId: number;
  environmentId: number;
  comment?: string;
}

export async function deployReleaseStage(
  connection: WebApi,
  options: DeployReleaseStageOptions,
): Promise<ReleaseEnvironment> {
  try {
    const releaseApi = await connection.getReleaseApi();
    const { projectId, releaseId, environmentId, comment } = options;

    const result = await releaseApi.updateReleaseEnvironment(
      {
        status: EnvironmentStatus.InProgress,
        comment,
      },
      projectId,
      releaseId,
      environmentId,
    );

    if (!result) {
      throw new AzureDevOpsError(
        `Failed to deploy stage ${environmentId} for release ${releaseId}`,
      );
    }

    return result;
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
          `Release ${options.releaseId} or stage ${options.environmentId} not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to deploy release stage: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const DeployReleaseStageSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  releaseId: z.number().describe('The ID of the release'),
  environmentId: z
    .number()
    .describe(
      'The ID of the stage (environment) to deploy. Get this from get_release environments[].id',
    ),
  comment: z
    .string()
    .optional()
    .describe('Optional comment for the deployment'),
});

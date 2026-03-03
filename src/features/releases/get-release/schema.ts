import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const GetReleaseSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  releaseId: z.number().describe('The ID of the release'),
});

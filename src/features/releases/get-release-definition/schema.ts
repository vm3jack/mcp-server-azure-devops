import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const GetReleaseDefinitionSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  definitionId: z.number().describe('The ID of the release definition'),
});

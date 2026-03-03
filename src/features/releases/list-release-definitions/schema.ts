import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const ListReleaseDefinitionsSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  searchText: z
    .string()
    .optional()
    .describe('Filter release definitions by name'),
  top: z
    .number()
    .optional()
    .describe('Maximum number of release definitions to return'),
  path: z
    .string()
    .optional()
    .describe('Filter by folder path (e.g. "\\MyFolder")'),
});

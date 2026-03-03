import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const ListReleasesSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  definitionId: z
    .number()
    .optional()
    .describe('Filter by release definition ID'),
  searchText: z.string().optional().describe('Filter releases by name'),
  top: z.number().optional().describe('Maximum number of releases to return'),
  createdBy: z
    .string()
    .optional()
    .describe('Filter by the user who created the release'),
  minCreatedTime: z
    .string()
    .optional()
    .describe('Filter releases created after this date (ISO 8601 format)'),
  maxCreatedTime: z
    .string()
    .optional()
    .describe('Filter releases created before this date (ISO 8601 format)'),
});

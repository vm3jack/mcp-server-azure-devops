import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const CreateReleaseSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  definitionId: z
    .number()
    .describe('The ID of the release definition to create a release from'),
  description: z.string().optional().describe('Description for the release'),
  artifactAlias: z
    .string()
    .optional()
    .describe('Alias of the artifact to use (e.g. "_MyBuildPipeline")'),
  artifactVersion: z
    .string()
    .optional()
    .describe('Version of the artifact to use (e.g. build number or commit)'),
});

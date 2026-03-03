import {
  ReleaseDefinition,
  Release,
  ReleaseStartMetadata,
  ReleaseEnvironment,
} from 'azure-devops-node-api/interfaces/ReleaseInterfaces';

export interface ListReleaseDefinitionsOptions {
  projectId: string;
  searchText?: string;
  top?: number;
  path?: string;
}

export interface GetReleaseDefinitionOptions {
  projectId: string;
  definitionId: number;
}

export interface ListReleasesOptions {
  projectId: string;
  definitionId?: number;
  searchText?: string;
  top?: number;
  createdBy?: string;
  minCreatedTime?: string;
  maxCreatedTime?: string;
}

export interface GetReleaseOptions {
  projectId: string;
  releaseId: number;
}

export interface CreateReleaseOptions {
  projectId: string;
  definitionId: number;
  description?: string;
  artifactAlias?: string;
  artifactVersion?: string;
}

export { ReleaseDefinition, Release, ReleaseStartMetadata, ReleaseEnvironment };

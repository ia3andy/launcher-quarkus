import { parse, stringify } from 'querystring';
import { ExtensionEntry } from '../pickers/extensions-picker';
import { createGitHubProject } from './code-quarkus-github-api';
import { QuarkusProject } from './model';
import { BACKEND_URL, CLIENT_NAME } from './env';

export enum Target {
  DOWNLOAD = 'DOWNLOAD',
  SHARE = 'SHARE',
  GITHUB = 'GITHUB'
}

export interface GenerateResult {
  target: Target;
  url: string;
  shareUrl?: string;
}

export function generateProjectQuery(project: QuarkusProject, github: boolean = false, shownDefaultParams: boolean = true): string {
  const defaultProject = newDefaultProject();

  const params: any = {
    ...(project.metadata.groupId && validateFieldDefaultParam(shownDefaultParams, project.metadata.groupId !== defaultProject.metadata.groupId) && { g: project.metadata.groupId }),
    ...(project.metadata.artifactId && validateFieldDefaultParam(shownDefaultParams, project.metadata.artifactId !== defaultProject.metadata.artifactId) && { a: project.metadata.artifactId }),
    ...(project.metadata.version && validateFieldDefaultParam(shownDefaultParams, project.metadata.version !== defaultProject.metadata.version) && { v: project.metadata.version }),
    ...(project.metadata.buildTool && validateFieldDefaultParam(shownDefaultParams, project.metadata.buildTool !== defaultProject.metadata.buildTool) && { b: project.metadata.buildTool }),
    ...(project.metadata.noExamples && validateFieldDefaultParam(shownDefaultParams, project.metadata.noExamples !== defaultProject.metadata.noExamples) && { ne: project.metadata.noExamples }),
    ...(project.extensions && validateFieldDefaultParam(shownDefaultParams, project.extensions.length !== defaultProject.extensions.length) && { s: project.extensions.map(e => e.shortId).join('.') }),
    cn: CLIENT_NAME
  };
  if (github) {
    params.github = true;
  }

  return stringify(params);
};

const validateFieldDefaultParam = (shownDefaultParams: boolean, expression: boolean) => {
  return (shownDefaultParams ? true : expression)
};

const BASE_LOCATION = window.location.href.replace(window.location.search, '');

export function getProjectDownloadUrl(project: QuarkusProject) {
  const baseUrl = BACKEND_URL.startsWith('http') ? BACKEND_URL : BASE_LOCATION;
  return `${baseUrl.replace(/\/$/, '')}/d?${generateProjectQuery(project)}`;
}

export function getProjectShareUrl(project: QuarkusProject, github = false) {
  return `${BASE_LOCATION}?${generateProjectQuery(project, github)}`;
}

export async function generateProject(environment: string, project: QuarkusProject, target: Target): Promise<GenerateResult> {
  switch (target) {
    case Target.DOWNLOAD:
    case Target.SHARE:
      const url = getProjectDownloadUrl(project);
      const shareUrl = getProjectShareUrl(project);
      if (target !== Target.SHARE && environment !== 'dev') {
        setTimeout(() => window.open(url, '_blank'), 500);
      }
      return { target, url, shareUrl };
    case Target.GITHUB:
      const result = await createGitHubProject(project);
      return { target, url: result.url };
  }
}

export const createOnGitHub = (project: QuarkusProject, clientId: string) => {
  const authParams = {
    redirect_uri: getProjectShareUrl(project, true),
    client_id: clientId,
    scope: 'public_repo,workflow',
    state: Math.random().toString(36)
  };
  const githubAuthorizeUrl = `https://github.com/login/oauth/authorize?${stringify(authParams)}`;
  window.location.href = githubAuthorizeUrl;
};

export function newDefaultProject(): QuarkusProject {
  return ({
    metadata: {
      groupId: 'org.acme',
      artifactId: 'code-with-quarkus',
      version: '1.0.0-SNAPSHOT',
      buildTool: 'MAVEN',
      noExamples: false
    },
    extensions: [],
  });
}

const queryName = 'extension-search';

export function resolveInitialFilterQueryParam(): string {
  return getParams(queryName) || '';
}

const getParams = (paramName: string): string | null => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

export function syncParamsInQuery(filterParam: string = '', project: QuarkusProject | undefined): void {
  if (!project) {
    window.history.replaceState(null, '', `/?${formatParam(queryName, filterParam)}`);
    return;
  }

  window.history.replaceState(null, '', `/${generateParamQuery(formatParam(queryName, filterParam), generateProjectQuery(project, false, false))}`)
};

const formatParam = (paramName: string, value: string): string => {
  if (value) {
    return `${paramName}=${value}`;
  }

  return '';
};

const generateParamQuery = (filter: string, project: string) => {
  if (filter && project) {
    return '?' + project + '&' + filter;
  }

  if (project) {
    return '?' + project;
  }

  if (filter) {
    return '?' + filter;
  }

  return '';
};

export function resolveInitialProject(extensions: ExtensionEntry[]) {
  return parseProjectInQuery(extensions) || newDefaultProject();
}

const defaultCleanHistory = () => {
  console.log(`remove query from url: ${window.location.search}`);
  window.history.replaceState({}, document.title, window.location.href.replace(window.location.search, ''));
};

export function parseProjectInQuery(extensions: ExtensionEntry[],
                                    search: string = window.location.search.substr(1),
                                    cleanHistory: () => void = defaultCleanHistory): QuarkusProject | undefined {
  if (search.length === 0) {
    return undefined;
  }
  const queryObj = parse(search);
  const shortIds = new Set((typeof queryObj.s === 'string') ? (queryObj.s as string).split('.') : []);
  const ids = new Set();
  const selectedExtensions = extensions.filter(e => {
    if (shortIds.has(e.shortId)) {
      const already = ids.has(e.id);
      ids.add(e.id);
      return !already;
    }
    return false;
  });
  const defaultProj = newDefaultProject();
  const project = {
    metadata: {
      groupId: queryObj.g || defaultProj.metadata.groupId,
      artifactId: queryObj.a || defaultProj.metadata.artifactId,
      version: queryObj.v || defaultProj.metadata.version,
      buildTool: queryObj.b || defaultProj.metadata.buildTool,
      noExamples: queryObj.ne || defaultProj.metadata.noExamples
    },
    extensions: selectedExtensions,
    github: queryObj.github === 'true' ? {
      code: queryObj.code,
      state: queryObj.state
    } : undefined
  } as QuarkusProject;
  if (project.github) {
    console.log('Received GitHub auth');
  }
  cleanHistory();
  return project;
}
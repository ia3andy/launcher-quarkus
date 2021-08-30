import { Config, Platform } from './model';
import { BACKEND_URL, REQUEST_OPTIONS } from './env';

let platform: Platform | undefined;
let config: Config | undefined;

export type PlatformApi = (streamKey?: String) => Promise<Platform>
export type ConfigApi = () => Promise<Config>

export async function fetchPlatform(streamKey?: String) {
  if (platform) {
    return platform!;
  }
  const path = streamKey ? `/api/extensions/stream/${streamKey}` : '/api/extensions';
  const data = await Promise.all([
    fetch(`${BACKEND_URL}${path}`, REQUEST_OPTIONS)
      .catch(() => Promise.reject(new Error('Failed to fetch the Quarkus extensions list from the api'))),
    fetch(`${BACKEND_URL}/api/streams`, REQUEST_OPTIONS)
      .catch(() => Promise.reject(new Error('Failed to fetch the Quarkus stream list from the api')))
  ]);
  if (!data[0].ok) {
    throw new Error('Failed to load the Quarkus extension list');
  }
  if (!data[1].ok) {
    throw new Error('Failed to load the Quarkus stream list');
  }
  const json = await Promise.all(data.map(d => d.json()));

  return {
    extensions: json[0],
    streams: json[1]
  };
}


export async function fetchConfig() {
  if (config) {
    return config!;
  }
  const data = await fetch(`${BACKEND_URL}/api/config`, REQUEST_OPTIONS)
    .catch(() => Promise.reject(new Error('Failed to fetch the configuration from the api')));
  if (!data.ok) {
    throw new Error('Failed to load Quarkus config');
  }
  config = await data.json();
  return config!;
}
import { Analytics, AnalyticsContext, GoogleAnalytics, useAnalytics } from '@quarkusio/code-quarkus.core.analytics';
import React, { useEffect, useState } from 'react';
import { Header } from './layout/header';
import './bootstrap-base.css';
import './code-quarkus.scss';
import { QuarkusProjectFlow } from './quarkus-project/quarkus-project-flow';
import { Config } from './api/model';
import { QuarkusBlurb } from './layout/quarkus-blurb';
import { ConfigApi, PlatformApi } from "./api/code-quarkus-api";
import { DataLoader, SentryBoundary } from "@quarkusio/code-quarkus.core.components";
import { getQueryStreamKey } from "./api/quarkus-project-utils";

export interface ConfiguredCodeQuarkusProps {
  config: Config;
  platformApi: PlatformApi;
}

export function ConfiguredCodeQuarkus(props: ConfiguredCodeQuarkusProps) {
  const [ analytics, setAnalytics ] = useState<Analytics>(useAnalytics());

  useEffect(() => {
    setAnalytics((prev) => {
      const newAnalytics = props.config.gaTrackingId ? new GoogleAnalytics(props.config.gaTrackingId) : prev;
      newAnalytics.init();
      return newAnalytics;
    });
  }, [ props.config.gaTrackingId ]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      <div className="code-quarkus">
        <DataLoader loader={() => props.platformApi(getQueryStreamKey())}>
          {platform => (
            <>
              <Header platform={platform}
                supportButton={props.config.features && props.config.features.includes('support-button')}/>
              <QuarkusProjectFlow {...props} platform={platform}/>
            </>
          )}
        </DataLoader>
        <QuarkusBlurb/>
      </div>
    </AnalyticsContext.Provider>
  );
}

export interface CodeQuarkusProps {
  configApi: ConfigApi;
  platformApi: PlatformApi;
}

export function CodeQuarkus(props: CodeQuarkusProps) {
  return (
    <DataLoader loader={props.configApi}>{config => (
      <SentryBoundary sentryDSN={config.sentryDSN} environment={config.environment}>
        <ConfiguredCodeQuarkus config={config} platformApi={props.platformApi} />
      </SentryBoundary>
    )}</DataLoader>
  );
}

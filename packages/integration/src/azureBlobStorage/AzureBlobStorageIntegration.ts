/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { basicIntegrations, defaultScmResolveUrl } from '../helpers';
import { ScmIntegration, ScmIntegrationsFactory } from '../types';
import {
  AzureBlobStorageIntegrationConfig,
  readAzureBlobStorageIntegrationConfigs,
} from './config';

/**
 * Microsoft Azure Blob storage based integration.
 *
 * @public
 */
export class AzureBlobStorageIntergation implements ScmIntegration {
  static factory: ScmIntegrationsFactory<AzureBlobStorageIntergation> = ({
    config,
  }) => {
    const configs = readAzureBlobStorageIntegrationConfigs(
      config.getOptionalConfigArray('integrations.azureBlobStorage') ?? [],
    );
    return basicIntegrations(
      configs.map(c => new AzureBlobStorageIntergation(c)),
      i => i.config.host,
    );
  };

  get type(): string {
    return 'azureBlobStorage';
  }

  get title(): string {
    return this.integrationConfig.host;
  }

  get config(): AzureBlobStorageIntegrationConfig {
    return this.integrationConfig;
  }

  constructor(
    private readonly integrationConfig: AzureBlobStorageIntegrationConfig,
  ) {}

  resolveUrl(options: {
    url: string;
    base: string;
    lineNumber?: number | undefined;
  }): string {
    const resolved = defaultScmResolveUrl(options);
    return resolved;
  }

  resolveEditUrl(url: string): string {
    const { accountName, subscriptionId, resourceGroup } =
      this.integrationConfig;

    if (accountName && subscriptionId && resourceGroup) {
      try {
        const urlObj = new URL(url);
        // The path is expected to be /container/path/to/blob
        const parts = urlObj.pathname.split('/');
        // parts[0] is empty string because pathname starts with /
        if (parts.length >= 3) {
          const containerName = parts[1];
          const blobPath = parts.slice(2).join('/');

          const storageAccountId = encodeURIComponent(
            `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Storage/storageAccounts/${accountName}`,
          );

          return `https://portal.azure.com/#view/Microsoft_Azure_Storage/BlobFileHandlerBlade/storageAccountId/${storageAccountId}/blobName/${encodeURIComponent(
            blobPath,
          )}/containerName/${encodeURIComponent(containerName)}`;
        }
      } catch {
        // Ignore errors and fallback to original URL
      }
    }

    return url;
  }
}

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

import { ConfigReader } from '@backstage/config';
import { AzureBlobStorageIntergation } from './AzureBlobStorageIntegration';

describe('AzureBlobStorageIntegration', () => {
  it('has a working factory', () => {
    const integrations = AzureBlobStorageIntergation.factory({
      config: new ConfigReader({
        integrations: {
          azureBlobStorage: [
            {
              endpoint: 'https://myaccount.blob.core.windows.net',
              accountName: 'myaccount',
              accountKey: 'someAccountKey',
            },
          ],
        },
      }),
    });
    expect(integrations.list().length).toBe(2); // including default
    expect(integrations.list()[0].config.host).toBe(
      'myaccount.blob.core.windows.net',
    );
    expect(integrations.list()[1].config.host).toBe('blob.core.windows.net'); // default integration
  });

  it('returns the basics', () => {
    const integration = new AzureBlobStorageIntergation({
      host: 'myaccount.blob.core.windows.net',
    } as any);
    expect(integration.type).toBe('azureBlobStorage');
    expect(integration.title).toBe('myaccount.blob.core.windows.net');
  });

  describe('resolveUrl', () => {
    it('works for valid URLs', () => {
      const integration = new AzureBlobStorageIntergation({
        host: 'blob.core.windows.net',
      } as any);

      expect(
        integration.resolveUrl({
          url: 'https://myaccount.blob.core.windows.net/container/file.yaml',
          base: 'https://myaccount.blob.core.windows.net/container/file.yaml',
        }),
      ).toBe('https://myaccount.blob.core.windows.net/container/file.yaml');
    });
  });

  describe('resolveEditUrl', () => {
    it('returns the input URL when subscription details are missing', () => {
      const integration = new AzureBlobStorageIntergation({
        host: 'myaccount.blob.core.windows.net',
        accountName: 'myaccount',
      } as any);

      expect(
        integration.resolveEditUrl(
          'https://myaccount.blob.core.windows.net/container/file.yaml',
        ),
      ).toBe('https://myaccount.blob.core.windows.net/container/file.yaml');
    });

    it('returns the Azure Portal URL when subscription details are present', () => {
      const integration = new AzureBlobStorageIntergation({
        host: 'myaccount.blob.core.windows.net',
        accountName: 'myaccount',
        subscriptionId: 'sub-id',
        resourceGroup: 'resource-group',
      } as any);

      const expectedUrl =
        'https://portal.azure.com/#view/Microsoft_Azure_Storage/BlobFileHandlerBlade/storageAccountId/%2Fsubscriptions%2Fsub-id%2FresourceGroups%2Fresource-group%2Fproviders%2FMicrosoft.Storage%2FstorageAccounts%2Fmyaccount/blobName/file.yaml/containerName/container';

      expect(
        integration.resolveEditUrl(
          'https://myaccount.blob.core.windows.net/container/file.yaml',
        ),
      ).toBe(expectedUrl);
    });

    it('handles blob paths with slashes', () => {
      const integration = new AzureBlobStorageIntergation({
        host: 'myaccount.blob.core.windows.net',
        accountName: 'myaccount',
        subscriptionId: 'sub-id',
        resourceGroup: 'resource-group',
      } as any);

      const expectedUrl =
        'https://portal.azure.com/#view/Microsoft_Azure_Storage/BlobFileHandlerBlade/storageAccountId/%2Fsubscriptions%2Fsub-id%2FresourceGroups%2Fresource-group%2Fproviders%2FMicrosoft.Storage%2FstorageAccounts%2Fmyaccount/blobName/folder%2Ffile.yaml/containerName/container';

      expect(
        integration.resolveEditUrl(
          'https://myaccount.blob.core.windows.net/container/folder/file.yaml',
        ),
      ).toBe(expectedUrl);
    });
  });
});

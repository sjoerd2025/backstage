/*
 * Copyright 2023 The Backstage Authors
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

import {
  createExtension,
  coreExtensionData,
  createExtensionInput,
  NotFoundErrorPage,
} from '@backstage/frontend-plugin-api';
import { Header } from '@backstage/ui';
import { ReactNode } from 'react';
import { Route, useRoutes, Routes as RRRoutes } from 'react-router-dom';

export const AppRoutes = createExtension({
  name: 'routes',
  attachTo: { id: 'app/layout', input: 'content' },
  inputs: {
    routes: createExtensionInput([
      coreExtensionData.routePath,
      coreExtensionData.routeRef.optional(),
      coreExtensionData.title.optional(),
      coreExtensionData.reactElement,
    ]),
    headerActions: createExtensionInput([coreExtensionData.reactElement]),
  },
  output: [coreExtensionData.reactElement],
  factory({ inputs }) {
    const headerActionsByPluginId = new Map<string, Array<ReactNode>>();
    for (const input of inputs.headerActions) {
      const action = input.get(coreExtensionData.reactElement);

      headerActionsByPluginId.set(input.node.spec.plugin.id, [
        ...(headerActionsByPluginId.get(input.node.spec.plugin.id) || []),
        action,
      ]);
    }

    const pagesByPath = new Map<
      string,
      Array<{ element: JSX.Element; title: string; node: AppNode }>
    >();
    console.log(`DEBUG: inputs=`, inputs);
    for (const input of inputs.routes) {
      const page = input.get(coreExtensionData.reactElement);
      const path = input.get(coreExtensionData.routePath);
      console.log(`DEBUG: path=`, path);
      const title = input.get(coreExtensionData.title);
      pagesByPath.set(path, [
        ...(pagesByPath.get(path) || []),
        { element: page, title: title ?? '', node: input.node },
      ]);
    }

    const Routes = () => {
      const element = useRoutes([
        ...Array.from(pagesByPath.entries()).map(([routePath, pages]) => {
          let element;
          if (pages.length > 1) {
            console.log(`DEBUG: pages=`, pages);
            const firstPluginId = pages[0].node.spec.plugin.id;
            element = (
              <>
                <Header
                  title={firstPluginId}
                  customActions={headerActionsByPluginId.get(firstPluginId)}
                  tabs={pages.map((page, index) => ({
                    matchStrategy: 'prefix',
                    label: page.title,
                    href: `${index}`,
                    id: String(index),
                  }))}
                />
                <RRRoutes>
                  {pages.map((page, index) => (
                    <Route
                      key={index}
                      path={`${index}`}
                      element={page.element}
                    />
                  ))}
                </RRRoutes>
              </>
            );
          } else {
            const page = pages[0];
            const pluginId = page.node.spec.plugin.id;
            element = (
              <>
                <Header
                  title={pluginId}
                  customActions={headerActionsByPluginId.get(pluginId)}
                />
                {page.element}
              </>
            );
          }

          return {
            path:
              routePath === '/'
                ? routePath
                : `${routePath.replace(/\/$/, '')}/*`,

            element,
          };
        }),
        {
          path: '*',
          element: <NotFoundErrorPage />,
        },
      ]);

      return element;
    };

    return [coreExtensionData.reactElement(<Routes />)];
  },
});

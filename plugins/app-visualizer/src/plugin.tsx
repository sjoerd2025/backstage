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
  createFrontendPlugin,
  createRouteRef,
  NavItemBlueprint,
  PageBlueprint,
  useApi,
  appTreeApiRef,
  createSubRouteRef,
} from '@backstage/frontend-plugin-api';
import VisualizerIcon from '@material-ui/icons/Visibility';

const rootRouteRef = createRouteRef();

const treeSubRouteRef = createSubRouteRef({
  parent: rootRouteRef,
  path: '/tree',
});

const detailedSubRouteRef = createSubRouteRef({
  parent: rootRouteRef,
  path: '/detailed',
});

const textSubRouteRef = createSubRouteRef({
  parent: rootRouteRef,
  path: '/text',
});

const appVisualizerPage = PageBlueprint.make({
  params: {
    path: '/visualizer',
    routeRef: rootRouteRef,
    title: 'Root',
    loader: async () => <div>The root page</div>,
  },
});

const appVisualizerPage2 = PageBlueprint.make({
  name: '2',
  params: {
    path: '/visualizer/something-else',
    routeRef: createRouteRef(),
    title: 'something else',
    loader: async () => <div>The root sdsd</div>,
  },
});
/*
// inputs:
//   pages: [explicitly subrouteref as a data type + element + path]
const rootPage = TabbedPageBlueprint.make({
  params: {
    path: '/visualizer',
    routeRef: rootRouteRef,
    actions: [
    ]
    subpages: [

    ]
  }
})

const treePageThing = PluginContentTopBarNavigableContentBlueprint.make({
  attachTo: {

  }
  params: {
    routeRef: treeSubRouteRef,
    loader: () => null,
  }
})
 */
const appVisualizerTreePage = PageBlueprint.make({
  name: 'tree',
  params: {
    path: '/visualizer',
    routeRef: treeSubRouteRef,
    title: 'Tree',
    loader: () =>
      import('./components/AppVisualizerPage/TreeVisualizer').then(m => {
        const Component = () => {
          const appTreeApi = useApi(appTreeApiRef);
          const { tree } = appTreeApi.getTree();
          return <m.TreeVisualizer tree={tree} />;
        };
        return <Component />;
      }),
  },
});
const appVisualizerDetailedPage = PageBlueprint.make({
  name: 'details',
  params: {
    path: '/visualizer',
    routeRef: detailedSubRouteRef,
    title: 'Detailed',
    loader: () =>
      import('./components/AppVisualizerPage/DetailedVisualizer').then(m => {
        const Component = () => {
          const appTreeApi = useApi(appTreeApiRef);
          const { tree } = appTreeApi.getTree();
          return <m.DetailedVisualizer tree={tree} />;
        };
        return <Component />;
      }),
  },
});
const appVisualizerTextPage = PageBlueprint.make({
  name: 'text',
  params: {
    path: '/visualizer',
    routeRef: textSubRouteRef,
    title: 'Text',
    loader: () =>
      import('./components/AppVisualizerPage/TextVisualizer').then(m => {
        const Component = () => {
          const appTreeApi = useApi(appTreeApiRef);
          const { tree } = appTreeApi.getTree();
          return <m.TextVisualizer tree={tree} />;
        };
        return <Component />;
      }),
  },
});

export const appVisualizerNavItem = NavItemBlueprint.make({
  params: {
    title: 'Visualizer',
    icon: VisualizerIcon,
    routeRef: rootRouteRef,
  },
});

/** @public */
export const visualizerPlugin = createFrontendPlugin({
  pluginId: 'app-visualizer',
  info: { packageJson: () => import('../package.json') },
  extensions: [
    appVisualizerPage,
    appVisualizerPage2,
    appVisualizerTreePage,
    appVisualizerDetailedPage,
    appVisualizerTextPage,
    appVisualizerNavItem,
  ],
});

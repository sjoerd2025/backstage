/*
 * Copyright 2020 The Backstage Authors
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

import { makeSidebarConfig, sidebarConfig } from './config';

describe('makeSidebarConfig', () => {
  it('should return default config when no options are provided', () => {
    const config = makeSidebarConfig({});
    expect(config).toEqual(expect.objectContaining(sidebarConfig));
  });

  it('should override drawerWidthOpen', () => {
    const config = makeSidebarConfig({ drawerWidthOpen: 300 });
    expect(config.drawerWidthOpen).toBe(300);
    expect(config.drawerWidthClosed).toBe(sidebarConfig.drawerWidthClosed);
  });

  it('should override drawerWidthClosed and update derived values', () => {
    const newWidth = 100;
    const config = makeSidebarConfig({ drawerWidthClosed: newWidth });

    expect(config.drawerWidthClosed).toBe(newWidth);

    // Check derived values
    expect(config.iconContainerWidth).toBe(newWidth);
    expect(config.iconSize).toBe(newWidth - sidebarConfig.iconPadding * 2);
    expect(config.userBadgeDiameter).toBe(
      newWidth - sidebarConfig.userBadgePadding * 2,
    );
  });
});

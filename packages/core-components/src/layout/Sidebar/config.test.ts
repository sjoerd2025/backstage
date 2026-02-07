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

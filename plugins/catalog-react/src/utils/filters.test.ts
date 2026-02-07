/*
 * Copyright 2021 The Backstage Authors
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
  reduceCatalogFilters,
  reduceBackendCatalogFilters,
  reduceEntityFilters,
} from './filters';
import {
  EntityKindFilter,
  EntityTypeFilter,
  EntityTagFilter,
  EntityOwnerFilter,
  EntityLifecycleFilter,
  EntityNamespaceFilter,
  EntityUserFilter,
  EntityOrphanFilter,
  EntityTextFilter,
  UserListFilter,
  EntityOrderFilter,
} from '../filters';
import { Entity } from '@backstage/catalog-model';

describe('filters', () => {
  describe('reduceCatalogFilters', () => {
    it('should return default state with empty filters', () => {
      const result = reduceCatalogFilters([]);
      expect(result).toEqual({
        filter: {},
        fullTextFilter: undefined,
        orderFields: [{ field: 'metadata.name', order: 'asc' }],
      });
    });

    it('should reduce generic filters', () => {
      const mockFilter1 = {
        getCatalogFilters: () => ({ 'metadata.name': 'test' }),
      };
      const mockFilter2 = {
        getCatalogFilters: () => ({ 'spec.type': 'service' }),
      };

      const result = reduceCatalogFilters([mockFilter1, mockFilter2]);
      expect(result.filter).toEqual({
        'metadata.name': 'test',
        'spec.type': 'service',
      });
    });

    it('should extract full text search term', () => {
      const textFilter = new EntityTextFilter('search-term');
      const result = reduceCatalogFilters([textFilter]);
      expect(result.fullTextFilter).toEqual({
        term: 'search-term',
        fields: ['metadata.name', 'metadata.title', 'spec.profile.displayName'],
      });
    });

    it('should extract order fields', () => {
      const orderFilter = new EntityOrderFilter([
        ['metadata.name', 'desc'],
        ['spec.type', 'asc'],
      ]);
      const result = reduceCatalogFilters([orderFilter]);
      expect(result.orderFields).toEqual([
        { field: 'metadata.name', order: 'desc' },
        { field: 'spec.type', order: 'asc' },
      ]);
    });

    it('should handle combination of filters', () => {
      const kindFilter = new EntityKindFilter('Component', 'Component');
      const textFilter = new EntityTextFilter('search');
      const orderFilter = new EntityOrderFilter([['metadata.name', 'desc']]);

      const result = reduceCatalogFilters([
        kindFilter,
        textFilter,
        orderFilter,
      ]);

      expect(result).toEqual({
        filter: { kind: 'Component' },
        fullTextFilter: {
          term: 'search',
          fields: [
            'metadata.name',
            'metadata.title',
            'spec.profile.displayName',
          ],
        },
        orderFields: [{ field: 'metadata.name', order: 'desc' }],
      });
    });
  });

  describe('reduceBackendCatalogFilters', () => {
    it('should return empty object for empty filters', () => {
      expect(reduceBackendCatalogFilters([])).toEqual({});
    });

    it('should include allowed filters', () => {
      const kindFilter = new EntityKindFilter('Component', 'Component');
      const typeFilter = new EntityTypeFilter('service');
      const result = reduceBackendCatalogFilters([kindFilter, typeFilter]);
      expect(result).toEqual({
        kind: 'Component',
        'spec.type': ['service'],
      });
    });

    it('should ignore disallowed filters', () => {
      const disallowedFilters = [
        new EntityTagFilter(['tag']),
        new EntityOwnerFilter(['owner']),
        new EntityLifecycleFilter(['production']),
        new EntityNamespaceFilter(['default']),
        EntityUserFilter.owned(['user:default/me']),
        new EntityOrphanFilter(true),
        new EntityTextFilter('search'),
        new UserListFilter(
          'owned',
          () => true,
          () => true,
        ),
      ];

      const result = reduceBackendCatalogFilters(disallowedFilters);
      expect(result).toEqual({});
    });

    it('should mix allowed and disallowed filters correctly', () => {
      const kindFilter = new EntityKindFilter('Component', 'Component');
      const tagFilter = new EntityTagFilter(['tag']);

      const result = reduceBackendCatalogFilters([kindFilter, tagFilter]);
      expect(result).toEqual({ kind: 'Component' });
    });
  });

  describe('reduceEntityFilters', () => {
    const entity = {
      metadata: {
        name: 'test-entity',
        tags: ['java'],
      },
    } as Entity;

    it('should return true if no filters provided', () => {
      const predicate = reduceEntityFilters([]);
      expect(predicate(entity)).toBe(true);
    });

    it('should return true if all filters match', () => {
      const filter1 = { filterEntity: () => true };
      const filter2 = { filterEntity: () => true };
      const predicate = reduceEntityFilters([filter1, filter2]);
      expect(predicate(entity)).toBe(true);
    });

    it('should return false if any filter fails', () => {
      const filter1 = { filterEntity: () => true };
      const filter2 = { filterEntity: () => false };
      const predicate = reduceEntityFilters([filter1, filter2]);
      expect(predicate(entity)).toBe(false);
    });

    it('should handle filters without filterEntity method (assume match)', () => {
      const filter = { getCatalogFilters: () => ({}) };
      const predicate = reduceEntityFilters([filter]);
      expect(predicate(entity)).toBe(true);
    });
  });
});

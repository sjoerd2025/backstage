/*
 * Copyright 2025 The Backstage Authors
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

import { Config } from '@backstage/config';
import { z } from 'zod';
import { createPredicateSchema } from './schema';
import { Predicate } from './types';

/**
 * Options for {@link readPredicateFromConfig}.
 *
 * @public
 */
export interface ReadPredicateFromConfigOptions {
  /**
   * The key to read from the config. If not provided, the entire config is used.
   */
  key?: string;
}

/**
 * Read a predicate from a config object.
 *
 * @public
 */
export function readPredicateFromConfig(
  config: Config,
  options?: ReadPredicateFromConfigOptions,
): Predicate {
  const key = options?.key;
  const value = key ? config.get(key) : config.get();

  const schema = createPredicateSchema(z);
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new Error(`Invalid predicate in config: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Read an optional predicate from a config object.
 *
 * @public
 */
export function readOptionalPredicateFromConfig(
  config: Config,
  options?: ReadPredicateFromConfigOptions,
): Predicate | undefined {
  const key = options?.key;
  const value = key ? config.getOptional(key) : config.getOptional();

  if (value === undefined) {
    return undefined;
  }

  return readPredicateFromConfig(config, options);
}

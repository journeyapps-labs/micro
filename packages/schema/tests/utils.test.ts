import { describe, test, expect } from 'vitest';

import * as utils from '../src/utils';
import schema from './fixtures/schema';

describe('utils', () => {
  test('allow additional properties in a json schema', () => {
    const cleaned_schema = utils.allowAdditionalProperties(schema);
    expect(cleaned_schema).toMatchSnapshot();
  });

  test('it should only modify additionalProperties if it is a boolean', () => {
    const cleaned_schema = utils.allowAdditionalProperties({
      definitions: {
        a: {
          type: 'object',
          properties: {
            prop: {
              type: 'string'
            }
          },
          additionalProperties: false,
          required: ['prop']
        }
      },

      type: 'object',
      properties: {
        name: {
          type: 'object',
          additionalProperties: {
            $ref: '#/definitions/a'
          }
        }
      },
      required: ['name', 'b'],
      additionalProperties: false
    });
    expect(cleaned_schema).toMatchSnapshot();
  });
});

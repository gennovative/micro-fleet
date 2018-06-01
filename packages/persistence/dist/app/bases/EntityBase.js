"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const mapKeys = require('lodash/mapKeys');
const snakeCase = global['snakeCase'];
const camelCase = global['camelCase'];
class EntityBase extends objection_1.Model {
    /**
     * @abstract
     */
    static get tableName() {
        throw 'This method must be implemented by derived class!';
    }
    // public id: BigInt = undefined;
    /**
     * This is called when an object is serialized to database format.
     */
    $formatDatabaseJson(json) {
        json = super.$formatDatabaseJson(json);
        return mapKeys(json, (value, key) => {
            // Maps from "camelCase" to "snake_case" except special keyword.
            /* istanbul ignore if */
            if (key.indexOf('#') == 0) {
                return key;
            }
            return snakeCase(key);
        });
    }
    /**
     * This is called when an object is read from database.
     */
    $parseDatabaseJson(json) {
        json = mapKeys(json, (value, key) => {
            // Maps from "snake_case" to "camelCase"
            return camelCase(key);
        });
        return super.$parseDatabaseJson(json);
    }
}
/**
 * [ObjectionJS] Array of primary column names.
 */
EntityBase.idColumn = ['id'];
/**
 * An array of non-primary unique column names.
 */
EntityBase.uniqColumn = [];
/**
 * Same with `idColumn`, but transform snakeCase to camelCase.
 * Should be overriden (['id', 'tenantId']) for composite PK.
 */
EntityBase.idProp = EntityBase.idColumn.map(camelCase);
exports.EntityBase = EntityBase;
EntityBase.knex(null);

//# sourceMappingURL=EntityBase.js.map

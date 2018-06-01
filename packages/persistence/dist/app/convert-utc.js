"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// PostgreSQL data type OID
const TIMESTAMPTZ_OID = 1184, // Timestamp without timezone
TIMESTAMP_OID = 1114, // Timestamp with timezone
DATE_OID = 1082;
/**
 * This piece of code makes sure all date values loaded from database are converted
 * as UTC format.
 */
/* istanbul ignore next */
let parseFn = function (val) {
    // Use this if you want Entity classes have Date OBJECT properties.
    // return val === null ? null : moment(val).toDate();
    // Use this if you want Entity classes have Date STRING properties.
    return val;
};
pg_1.types.setTypeParser(TIMESTAMPTZ_OID, parseFn);
pg_1.types.setTypeParser(TIMESTAMP_OID, parseFn);
pg_1.types.setTypeParser(DATE_OID, parseFn);

//# sourceMappingURL=convert-utc.js.map

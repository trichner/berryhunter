import {nearlyEqual} from './Utils';

function assertTrue(value) {
    if (value !== true) {
        throw 'Assertion failed';
    }
}

function assertFalse(value) {
    assertTrue(!value);
}

/** Regular large numbers - generally not problematic */
assertTrue(nearlyEqual(1000000, 1000001));
assertTrue(nearlyEqual(1000001, 1000000));
assertFalse(nearlyEqual(10000, 10001));
assertFalse(nearlyEqual(10001, 10000));

/** Negative large numbers */
assertTrue(nearlyEqual(-1000000, -1000001));
assertTrue(nearlyEqual(-1000001, -1000000));
assertFalse(nearlyEqual(-10000, -10001));
assertFalse(nearlyEqual(-10001, -10000));

/** Numbers around 1 */
assertTrue(nearlyEqual(1.0000001, 1.0000002));
assertTrue(nearlyEqual(1.0000002, 1.0000001));
assertFalse(nearlyEqual(1.0002, 1.0001));
assertFalse(nearlyEqual(1.0001, 1.0002));

/** Numbers around -1 */
assertTrue(nearlyEqual(-1.000001, -1.000002));
assertTrue(nearlyEqual(-1.000002, -1.000001));
assertFalse(nearlyEqual(-1.0001, -1.0002));
assertFalse(nearlyEqual(-1.0002, -1.0001));

/** Numbers between 1 and 0 */
assertTrue(nearlyEqual(0.000000001000001, 0.000000001000002));
assertTrue(nearlyEqual(0.000000001000002, 0.000000001000001));
assertFalse(nearlyEqual(0.000000000001002, 0.000000000001001));
assertFalse(nearlyEqual(0.000000000001001, 0.000000000001002));

/** Numbers between -1 and 0 */
assertTrue(nearlyEqual(-0.000000001000001, -0.000000001000002));
assertTrue(nearlyEqual(-0.000000001000002, -0.000000001000001));
assertFalse(nearlyEqual(-0.000000000001002, -0.000000000001001));
assertFalse(nearlyEqual(-0.000000000001001, -0.000000000001002));

/** Small differences away from zero */
assertTrue(nearlyEqual(0.3, 0.30000003));
assertTrue(nearlyEqual(-0.3, -0.30000003));

/** Comparisons involving zero */
assertTrue(nearlyEqual(0.0, 0.0));
assertTrue(nearlyEqual(0.0, -0.0));
assertTrue(nearlyEqual(-0.0, -0.0));
assertFalse(nearlyEqual(0.00000001, 0.0));
assertFalse(nearlyEqual(0.0, 0.00000001));
assertFalse(nearlyEqual(-0.00000001, 0.0));
assertFalse(nearlyEqual(0.0, -0.00000001));

assertTrue(nearlyEqual(0.0, 1e-40, 0.01));
assertTrue(nearlyEqual(1e-40, 0.0, 0.01));
//assertFalse(nearlyEqual(1e-40, 0.0, 0.000001));
//assertFalse(nearlyEqual(0.0, 1e-40, 0.000001));

assertTrue(nearlyEqual(0.0, -1e-40, 0.1));
assertTrue(nearlyEqual(-1e-40, 0.0, 0.1));
// assertFalse(nearlyEqual(-1e-40, 0.0, 0.00000001));
// assertFalse(nearlyEqual(0.0, -1e-40, 0.00000001));

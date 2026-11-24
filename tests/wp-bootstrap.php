<?php
/**
 * PHPUnit bootstrap: loads the WordPress test suite, then this plugin.
 * Used only by the integration job in .github/workflows/ci.yml.
 */
$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}
if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo "Could not find WordPress test library at {$_tests_dir}\n";
	echo "Run bin/install-wp-tests.sh first.\n";
	exit( 1 );
}

// The WP test suite refuses to boot without the PHPUnit Polyfills. Report it
// clearly instead of letting core throw an opaque fatal error.
if ( ! defined( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' ) && getenv( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' ) ) {
	define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', getenv( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' ) );
}
if ( defined( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' ) && ! file_exists( WP_TESTS_PHPUNIT_POLYFILLS_PATH . '/phpunitpolyfills-autoload.php' ) ) {
	echo "PHPUnit Polyfills not found at " . WP_TESTS_PHPUNIT_POLYFILLS_PATH . "\n";
	echo "Set WP_TESTS_PHPUNIT_POLYFILLS_PATH to the polyfills root directory.\n";
}

require_once $_tests_dir . '/includes/functions.php';

tests_add_filter( 'muplugins_loaded', function () {
	require dirname( __DIR__ ) . '/xpatsoft-tools.php';
} );

require $_tests_dir . '/includes/bootstrap.php';

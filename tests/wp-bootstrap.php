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

require_once $_tests_dir . '/includes/functions.php';

tests_add_filter( 'muplugins_loaded', function () {
	require dirname( __DIR__ ) . '/xpatsoft-tools.php';
} );

require $_tests_dir . '/includes/bootstrap.php';

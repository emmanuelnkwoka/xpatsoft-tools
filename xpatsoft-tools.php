<?php
/**
 * Plugin Name:       XPATSOFT TOOLS
 * Plugin URI:        https://xpatsoft.com/tools/
 * Description:       Free. Private. Useful. No unnecessary signup. A modular collection of browser-first utility tools.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Tested up to:      6.8
 * Requires PHP:      7.4
 * Author:            XPATSOFT INNOVATION
 * Author URI:        https://xpatsoft.com/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       xpatsoft-tools
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'XPATSOFT_TOOLS_VERSION', '1.0.0' );
define( 'XPATSOFT_TOOLS_FILE', __FILE__ );
define( 'XPATSOFT_TOOLS_PATH', plugin_dir_path( __FILE__ ) );
define( 'XPATSOFT_TOOLS_URL', plugin_dir_url( __FILE__ ) );

require_once XPATSOFT_TOOLS_PATH . 'includes/class-xpatsoft-helpers.php';
require_once XPATSOFT_TOOLS_PATH . 'includes/class-xpatsoft-registry.php';
require_once XPATSOFT_TOOLS_PATH . 'includes/class-xpatsoft-security.php';
require_once XPATSOFT_TOOLS_PATH . 'includes/class-xpatsoft-assets.php';
require_once XPATSOFT_TOOLS_PATH . 'includes/class-xpatsoft-shortcodes.php';
require_once XPATSOFT_TOOLS_PATH . 'includes/class-xpatsoft-admin.php';
require_once XPATSOFT_TOOLS_PATH . 'includes/class-xpatsoft-tools.php';

register_activation_hook( __FILE__, array( 'XPATSOFT_Tools', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'XPATSOFT_Tools', 'deactivate' ) );

add_action( 'plugins_loaded', function() {
    XPATSOFT_Tools::instance();
} );

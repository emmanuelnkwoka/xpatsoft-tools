<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class XPATSOFT_Tools {
    private static $instance = null;
    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
            self::$instance->init();
        }
        return self::$instance;
    }
    private function init() {
        XPATSOFT_Registry::init();
        XPATSOFT_Assets::init();
        XPATSOFT_Shortcodes::init();
        if ( is_admin() ) XPATSOFT_Admin::init();
        add_action( 'init', array( __CLASS__, 'maybe_register_pages' ) );
    }
    public static function activate() {
        if ( ! get_option( 'xpatsoft_tools_active' ) ) {
            update_option( 'xpatsoft_tools_active', array( 'qr-code-generator','invoice-generator','pdf-compressor','image-compressor','word-counter' ) );
        }
        if ( ! get_option( 'xpatsoft_tools_settings' ) ) {
            update_option( 'xpatsoft_tools_settings', array( 'tagline' => 'FREE. PRIVATE. USEFUL. NO UNNECESSARY SIGNUP.', 'privacy_note' => 'All tools run in your browser. Your files never leave your device.' ) );
        }
        flush_rewrite_rules();
    }
    public static function deactivate() { flush_rewrite_rules(); }
    public static function maybe_register_pages() {
        // Pages are created manually by admin via shortcodes; this hook is reserved for future CPT registration.
    }
}

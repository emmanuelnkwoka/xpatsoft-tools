<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class XPATSOFT_Admin {
    public static function init() {
        add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
        add_action( 'admin_post_xpatsoft_save_settings', array( __CLASS__, 'save_settings' ) );
        add_action( 'admin_post_xpatsoft_toggle_tool', array( __CLASS__, 'toggle_tool' ) );
    }
    public static function menu() {
        add_menu_page( 'XPATSOFT Tools', 'XPATSOFT Tools', 'manage_options', 'xpatsoft-tools', array( __CLASS__, 'render' ), 'dashicons-admin-generic', 26 );
    }
    public static function render() {
        if ( ! XPATSOFT_Security::can_manage() ) { wp_die( esc_html__( 'Unauthorized.', 'xpatsoft-tools' ) ); }
        wp_enqueue_style( 'xpatsoft-tools-admin' );
        $tools = XPATSOFT_Registry::all();
        $active = XPATSOFT_Registry::active();
        include XPATSOFT_TOOLS_PATH . 'admin/views/dashboard.php';
    }
    public static function save_settings() {
        if ( ! XPATSOFT_Security::verify_admin_request() ) wp_die( 'Invalid nonce.' );
        $tagline = isset( $_POST['xpatsoft_tagline'] ) ? XPATSOFT_Security::sanitize_text( $_POST['xpatsoft_tagline'] ) : '';
        $privacy = isset( $_POST['xpatsoft_privacy_note'] ) ? XPATSOFT_Security::sanitize_textarea( $_POST['xpatsoft_privacy_note'] ) : '';
        XPATSOFT_Helpers::set_option( 'tagline', $tagline );
        XPATSOFT_Helpers::set_option( 'privacy_note', $privacy );
        wp_safe_redirect( admin_url( 'admin.php?page=xpatsoft-tools&saved=1' ) );
        exit;
    }
    public static function toggle_tool() {
        if ( ! XPATSOFT_Security::verify_admin_request() ) wp_die( 'Invalid nonce.' );
        $id = isset( $_POST['tool_id'] ) ? XPATSOFT_Helpers::sanitize_id( $_POST['tool_id'] ) : '';
        $on = isset( $_POST['active'] ) && $_POST['active'] === '1';
        if ( $id && XPATSOFT_Registry::get( $id ) ) XPATSOFT_Helpers::set_tool_active( $id, $on );
        wp_safe_redirect( admin_url( 'admin.php?page=xpatsoft-tools' ) );
        exit;
    }
}

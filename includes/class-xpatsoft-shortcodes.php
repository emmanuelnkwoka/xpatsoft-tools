<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class XPATSOFT_Shortcodes {
    public static function init() {
        add_shortcode( 'xpatsoft_tools', array( __CLASS__, 'render_directory' ) );
        add_shortcode( 'xpatsoft_tool', array( __CLASS__, 'render_tool' ) );
    }
    public static function render_directory( $atts ) {
        XPATSOFT_Assets::enqueue_directory();
        $tools = XPATSOFT_Registry::active();
        $cats = XPATSOFT_Registry::categories();
        ob_start();
        include XPATSOFT_TOOLS_PATH . 'templates/directory.php';
        return ob_get_clean();
    }
    public static function render_tool( $atts ) {
        $a = shortcode_atts( array( 'id' => '' ), $atts, 'xpatsoft_tool' );
        $id = XPATSOFT_Helpers::sanitize_id( $a['id'] );
        $tool = XPATSOFT_Registry::get( $id );
        if ( ! $tool ) return '<div class="xpatsoft-error">' . esc_html__( 'Tool not found.', 'xpatsoft-tools' ) . '</div>';
        if ( ! XPATSOFT_Helpers::is_tool_active( $id ) ) return '<div class="xpatsoft-error">' . esc_html__( 'This tool is currently unavailable.', 'xpatsoft-tools' ) . '</div>';
        XPATSOFT_Assets::enqueue_tool( $id );
        $view = XPATSOFT_TOOLS_PATH . 'tools/' . $id . '/views/tool.php';
        if ( ! file_exists( $view ) ) return '<div class="xpatsoft-error">' . esc_html__( 'Tool view missing.', 'xpatsoft-tools' ) . '</div>';
        ob_start();
        include $view;
        return ob_get_clean();
    }
}

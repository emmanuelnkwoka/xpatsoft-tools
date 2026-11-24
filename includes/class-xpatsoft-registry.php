<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class XPATSOFT_Registry {
    private static $tools = array();
    private static $loaded = false;

    public static function init() {
        if ( self::$loaded ) return;
        self::$loaded = true;
        $base = XPATSOFT_TOOLS_PATH . 'tools/';
        if ( ! is_dir( $base ) ) return;
        foreach ( glob( $base . '*/' ) as $dir ) {
            $slug = basename( $dir );
            $file = $dir . $slug . '.php';
            if ( file_exists( $file ) ) {
                try { require_once $file; } catch ( Throwable $e ) { error_log( 'XPATSOFT Tools load error ' . $slug . ': ' . $e->getMessage() ); }
            }
        }
    }

    public static function register( $id, $args ) {
        $id = XPATSOFT_Helpers::sanitize_id( $id );
        if ( ! $id ) return false;
        $defaults = array(
            'title' => $id, 'description' => '', 'category' => 'General',
            'icon' => 'dashicons-admin-generic', 'version' => '1.0.0',
            'popular' => false, 'keywords' => '', 'instructions' => '',
            'faqs' => array(), 'privacy' => '', 'file' => '',
        );
        self::$tools[ $id ] = wp_parse_args( $args, $defaults );
        return true;
    }

    public static function all() { self::init(); return self::$tools; }
    public static function get( $id ) { self::init(); $id = XPATSOFT_Helpers::sanitize_id( $id ); return isset( self::$tools[ $id ] ) ? self::$tools[ $id ] : null; }
    public static function active() {
        self::init();
        $out = array();
        foreach ( self::$tools as $id => $t ) { if ( XPATSOFT_Helpers::is_tool_active( $id ) ) $out[ $id ] = $t; }
        return $out;
    }
    public static function categories() {
        $cats = array();
        foreach ( self::active() as $t ) { $cats[ $t['category'] ] = true; }
        return array_keys( $cats );
    }
    public static function count() { self::init(); return count( self::$tools ); }
}

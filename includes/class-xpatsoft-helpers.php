<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class XPATSOFT_Helpers {
    public static function format_bytes( $bytes, $precision = 2 ) {
        $bytes = max( 0, (float) $bytes );
        $units = array( 'B', 'KB', 'MB', 'GB' );
        $i = 0;
        while ( $bytes >= 1024 && $i < count( $units ) - 1 ) { $bytes /= 1024; $i++; }
        return round( $bytes, $precision ) . ' ' . $units[ $i ];
    }
    public static function sanitize_id( $id ) {
        return sanitize_key( preg_replace( '/[^a-z0-9\-_]/i', '', (string) $id ) );
    }
    public static function get_option( $key, $default = null ) {
        $opts = get_option( 'xpatsoft_tools_settings', array() );
        return isset( $opts[ $key ] ) ? $opts[ $key ] : $default;
    }
    public static function set_option( $key, $value ) {
        $opts = get_option( 'xpatsoft_tools_settings', array() );
        $opts[ $key ] = $value;
        update_option( 'xpatsoft_tools_settings', $opts );
    }
    public static function is_tool_active( $id ) {
        $active = get_option( 'xpatsoft_tools_active', array( 'qr-code-generator','invoice-generator','pdf-compressor','image-compressor','word-counter' ) );
        return in_array( $id, (array) $active, true );
    }
    public static function set_tool_active( $id, $active ) {
        $list = get_option( 'xpatsoft_tools_active', array( 'qr-code-generator','invoice-generator','pdf-compressor','image-compressor','word-counter' ) );
        $list = array_values( array_unique( (array) $list ) );
        if ( $active && ! in_array( $id, $list, true ) ) { $list[] = $id; }
        if ( ! $active ) { $list = array_values( array_diff( $list, array( $id ) ) ); }
        update_option( 'xpatsoft_tools_active', $list );
    }
}

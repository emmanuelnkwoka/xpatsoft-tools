<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class XPATSOFT_Security {
    public static function can_manage() { return current_user_can( 'manage_options' ); }
    public static function verify_admin_request() {
        if ( ! self::can_manage() ) return false;
        if ( ! isset( $_POST['_xpatsoft_nonce'] ) ) return false;
        return wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_xpatsoft_nonce'] ) ), 'xpatsoft_admin' );
    }
    public static function nonce_field() { return wp_nonce_field( 'xpatsoft_admin', '_xpatsoft_nonce' ); }
    public static function sanitize_text( $v ) { return sanitize_text_field( wp_unslash( (string) $v ) ); }
    public static function sanitize_textarea( $v ) { return sanitize_textarea_field( wp_unslash( (string) $v ) ); }
    public static function validate_file_upload( $file, $allowed_mimes, $max_bytes ) {
        if ( empty( $file['error'] ) && $file['error'] !== UPLOAD_ERR_OK ) return new WP_Error( 'upload_error', 'Upload failed.' );
        if ( empty( $file['tmp_name'] ) || ! is_uploaded_file( $file['tmp_name'] ) ) return new WP_Error( 'invalid_upload', 'Invalid upload.' );
        if ( $file['size'] > $max_bytes ) return new WP_Error( 'too_large', 'File exceeds maximum size.' );
        $check = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'], $allowed_mimes );
        if ( empty( $check['ext'] ) ) return new WP_Error( 'invalid_type', 'File type not allowed.' );
        return true;
    }
}

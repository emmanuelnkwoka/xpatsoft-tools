<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class XPATSOFT_Assets {
    public static function init() {
        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_shared' ) );
        add_action( 'admin_enqueue_scripts', array( __CLASS__, 'register_admin' ) );
    }
    public static function register_shared() {
        wp_register_style( 'xpatsoft-tools', XPATSOFT_TOOLS_URL . 'assets/css/xpatsoft-tools.css', array(), XPATSOFT_TOOLS_VERSION );
        wp_register_script( 'xpatsoft-tools', XPATSOFT_TOOLS_URL . 'assets/js/xpatsoft-tools.js', array(), XPATSOFT_TOOLS_VERSION, true );
    }
    public static function register_admin() {
        wp_register_style( 'xpatsoft-tools-admin', XPATSOFT_TOOLS_URL . 'assets/css/xpatsoft-tools-admin.css', array(), XPATSOFT_TOOLS_VERSION );
    }
    public static function enqueue_directory() {
        wp_enqueue_style( 'xpatsoft-tools' );
        wp_enqueue_script( 'xpatsoft-tools' );
    }
    public static function enqueue_tool( $id ) {
        self::register_shared();
        wp_enqueue_style( 'xpatsoft-tools' );
        wp_enqueue_script( 'xpatsoft-tools' );
        $tool = XPATSOFT_Registry::get( $id );
        if ( ! $tool ) return;
        $base = XPATSOFT_TOOLS_URL . 'tools/' . $id . '/assets/';
        $css = $base . 'css/' . $id . '.css';
        $js  = $base . 'js/' . $id . '.js';
        // Only enqueue if files exist on disk to avoid 404s.
        $path = XPATSOFT_TOOLS_PATH . 'tools/' . $id . '/assets/';
        if ( file_exists( $path . 'css/' . $id . '.css' ) ) {
            wp_enqueue_style( 'xpatsoft-' . $id, $css, array( 'xpatsoft-tools' ), XPATSOFT_TOOLS_VERSION );
        }
        if ( file_exists( $path . 'js/' . $id . '.js' ) ) {
            $deps = array();
            // Per-tool CDN deps loaded lazily only on that tool page.
            if ( $id === 'qr-code-generator' ) {
                wp_enqueue_script( 'qrcode-generator', 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js', array(), '1.4.4', true );
                $deps[] = 'qrcode-generator';
            }
            if ( $id === 'pdf-compressor' ) {
                wp_enqueue_script( 'pdf-lib', 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js', array(), '1.17.1', true );
                wp_enqueue_script( 'pdfjs', 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js', array(), '3.11.174', true );
                $deps = array( 'pdf-lib', 'pdfjs' );
            }
            if ( $id === 'image-compressor' ) {
                wp_enqueue_script( 'jszip', 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', array(), '3.10.1', true );
                $deps[] = 'jszip';
            }
            if ( $id === 'invoice-generator' ) {
                wp_enqueue_script( 'jspdf', 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', array(), '2.5.1', true );
                wp_enqueue_script( 'html2canvas', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', array(), '1.4.1', true );
                $deps = array( 'jspdf', 'html2canvas' );
            }
            wp_enqueue_script( 'xpatsoft-' . $id, $js, $deps, XPATSOFT_TOOLS_VERSION, true );
            wp_localize_script( 'xpatsoft-' . $id, 'XPATSOFT_' . strtoupper( str_replace( '-', '_', $id ) ), array(
                'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                'nonce'   => wp_create_nonce( 'xpatsoft_frontend' ),
                'toolId'  => $id,
            ) );
        }
    }
}

<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class XPATSOFT_Assets {
    public static function init() {
        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_shared' ) );
        add_action( 'admin_enqueue_scripts', array( __CLASS__, 'register_admin' ) );
    }
    public static function register_shared() {
        wp_register_style( 'xpatsoft-tools', XPATSOFT_TOOLS_URL . 'assets/css/xpatsoft-tools.css', array(), XPATSOFT_TOOLS_VERSION );
        wp_register_script( 'xpatsoft-utils', XPATSOFT_TOOLS_URL . 'assets/js/xpatsoft-utils.js', array(), XPATSOFT_TOOLS_VERSION, true );
        wp_register_script( 'xpatsoft-tools', XPATSOFT_TOOLS_URL . 'assets/js/xpatsoft-tools.js', array( 'xpatsoft-utils' ), XPATSOFT_TOOLS_VERSION, true );
    }
    public static function register_admin() {
        wp_register_style( 'xpatsoft-tools-admin', XPATSOFT_TOOLS_URL . 'assets/css/xpatsoft-tools-admin.css', array(), XPATSOFT_TOOLS_VERSION );
    }
    public static function enqueue_directory() {
        wp_enqueue_style( 'xpatsoft-tools' );
        wp_enqueue_script( 'xpatsoft-utils' );
        wp_enqueue_script( 'xpatsoft-tools' );
    }
    public static function enqueue_tool( $id ) {
        self::register_shared();
        wp_enqueue_style( 'xpatsoft-tools' );
        wp_enqueue_script( 'xpatsoft-utils' );
        wp_enqueue_script( 'xpatsoft-tools' );
        $tool = XPATSOFT_Registry::get( $id );
        if ( ! $tool ) return;
        $base = XPATSOFT_TOOLS_URL . 'tools/' . $id . '/assets/';
        $css = $base . 'css/' . $id . '.css';
        $js  = $base . 'js/' . $id . '.js';
        $path = XPATSOFT_TOOLS_PATH . 'tools/' . $id . '/assets/';
        if ( file_exists( $path . 'css/' . $id . '.css' ) ) {
            wp_enqueue_style( 'xpatsoft-' . $id, $css, array( 'xpatsoft-tools' ), XPATSOFT_TOOLS_VERSION );
        }
        if ( file_exists( $path . 'js/' . $id . '.js' ) ) {
            $deps = array( 'xpatsoft-utils' );
            $vendor = XPATSOFT_TOOLS_URL . 'assets/vendor/';
            // Self-hosted pinned vendor libraries (see assets/vendor/README.md).
            if ( $id === 'qr-code-generator' ) {
                wp_enqueue_script( 'qrcode-generator', $vendor . 'qrcode-generator/qrcode.js', array(), '1.4.4', true );
                wp_enqueue_script( 'qrcode-generator-utf8', $vendor . 'qrcode-generator/qrcode_UTF8.js', array( 'qrcode-generator' ), '1.4.4', true );
                $deps = array_merge( $deps, array( 'qrcode-generator', 'qrcode-generator-utf8' ) );
            }
            if ( $id === 'pdf-compressor' ) {
                wp_enqueue_script( 'pdf-lib', $vendor . 'pdf-lib/pdf-lib.min.js', array(), '1.17.1', true );
                wp_enqueue_script( 'pdfjs', $vendor . 'pdfjs-dist/pdf.min.js', array(), '3.11.174', true );
                $deps = array_merge( $deps, array( 'pdf-lib', 'pdfjs' ) );
            }
            if ( $id === 'image-compressor' ) {
                wp_enqueue_script( 'jszip', $vendor . 'jszip/jszip.min.js', array(), '3.10.1', true );
                $deps[] = 'jszip';
            }
            if ( $id === 'invoice-generator' ) {
                wp_enqueue_script( 'jspdf', $vendor . 'jspdf/jspdf.umd.min.js', array(), '2.5.1', true );
                wp_enqueue_script( 'html2canvas', $vendor . 'html2canvas/html2canvas.min.js', array(), '1.4.1', true );
                $deps = array_merge( $deps, array( 'jspdf', 'html2canvas' ) );
            }
            wp_enqueue_script( 'xpatsoft-' . $id, $js, $deps, XPATSOFT_TOOLS_VERSION, true );
            wp_localize_script( 'xpatsoft-' . $id, 'XPATSOFT_' . strtoupper( str_replace( '-', '_', $id ) ), array(
                'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                'nonce'   => wp_create_nonce( 'xpatsoft_frontend' ),
                'toolId'  => $id,
                'workerUrl' => $vendor . 'pdfjs-dist/pdf.worker.min.js',
            ) );
        }
    }
}

<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
XPATSOFT_Registry::register( 'qr-code-generator', array(
    'title' => 'QR Code Generator',
    'description' => 'Create static QR codes for URLs, text, Wi-Fi, WhatsApp, email, phone and vCards. Download PNG or SVG.',
    'category' => 'Generators',
    'icon' => 'dashicons-camera',
    'version' => '1.1.0',
    'popular' => true,
    'keywords' => 'qr code generator wifi whatsapp vcard png svg',
    'instructions' => 'Choose a QR type, enter details, customise colours and size, then download PNG or SVG. All generation happens locally in your browser.',
    'faqs' => array(
        array( 'q' => 'Are QR codes stored on a server?', 'a' => 'No. Static QR codes are generated locally in your browser. Nothing is uploaded or stored.' ),
        array( 'q' => 'Do QR codes expire?', 'a' => 'No. Static QR codes never expire and have no watermark or account requirement.' ),
        array( 'q' => 'Will scanners read my QR code?', 'a' => 'Yes, if you keep sufficient quiet-zone margin and contrast. Use error correction level M or Q for logos.' ),
    ),
    'privacy' => 'Your input stays on your device. No external generation API is used.',
) );

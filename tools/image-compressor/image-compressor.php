<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
XPATSOFT_Registry::register( 'image-compressor', array(
    'title' => 'Image Compressor',
    'description' => 'Compress JPG, PNG and WebP images in batch, entirely in your browser. Quality slider and ZIP download.',
    'category' => 'Files',
    'icon' => 'dashicons-format-image',
    'version' => '1.1.0',
    'popular' => true,
    'keywords' => 'image compressor compress jpg png webp zip',
    'instructions' => 'Add images, set quality and output format, then compress and download individually or as ZIP. Processing is local.',
    'faqs' => array(
        array( 'q' => 'Are images uploaded?', 'a' => 'No. Compression uses the browser Canvas API on your device.' ),
        array( 'q' => 'What happens to transparency?', 'a' => 'PNG transparency is preserved for PNG output and flattened onto white for JPG output.' ),
        array( 'q' => 'Are dimensions changed?', 'a' => 'No, dimensions are preserved unless you choose to resize in a future version.' ),
    ),
    'privacy' => 'Images never leave your device.',
) );

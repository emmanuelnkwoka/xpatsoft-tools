<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
XPATSOFT_Registry::register( 'pdf-compressor', array(
    'title' => 'PDF Compressor',
    'description' => 'Compress PDFs entirely in your browser. Quality presets and target sizes with real image recompression.',
    'category' => 'Files',
    'icon' => 'dashicons-media-spreadsheet',
    'version' => '1.0.0',
    'popular' => true,
    'keywords' => 'pdf compressor compress pdf reduce size',
    'instructions' => 'Drop a PDF, choose a quality preset or target size, then download the compressed file. Processing is 100% local.',
    'faqs' => array(
        array( 'q' => 'Is my PDF uploaded?', 'a' => 'No. Compression runs locally with pdf-lib and pdf.js in your browser.' ),
        array( 'q' => 'Can you guarantee an exact target size?', 'a' => 'No tool can guarantee an exact byte size for every PDF. We iterate to get as close as possible and return the best valid result.' ),
        array( 'q' => 'Will text remain selectable?', 'a' => 'Our engine rasterises pages to images for reliable size reduction, so text may become non-selectable. Visual content and readability are preserved.' ),
    ),
    'privacy' => 'Files never leave your device. Encrypted PDFs cannot be processed.',
) );

<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
XPATSOFT_Registry::register( 'pdf-compressor', array(
    'title' => 'PDF Compressor',
    'description' => 'Compress PDFs entirely in your browser. Text-preserving Optimise mode plus optional Rebuild mode.',
    'category' => 'Files',
    'icon' => 'dashicons-media-spreadsheet',
    'version' => '1.1.0',
    'popular' => true,
    'keywords' => 'pdf compressor compress pdf reduce size',
    'instructions' => 'Drop a PDF, choose Optimise (text preserved) or Rebuild (smallest), then download. Processing is 100% local.',
    'faqs' => array(
        array( 'q' => 'Is my PDF uploaded?', 'a' => 'No. Compression runs locally with pdf-lib (and pdf.js for Rebuild mode) in your browser.' ),
        array( 'q' => 'Does Optimise mode preserve text?', 'a' => 'Yes. Optimise copies pages without rasterising, so text, vectors, page sizes and metadata are preserved. Embedded JPEGs are recompressed where possible.' ),
        array( 'q' => 'What does Rebuild mode do?', 'a' => 'Rebuild renders pages to images for the smallest size. Text becomes non-selectable and non-searchable. Use it only when size matters more than text.' ),
        array( 'q' => 'Can you guarantee an exact target size?', 'a' => 'No tool can guarantee an exact byte size for every PDF. We iterate to get as close as possible and return the best valid result.' ),
    ),
    'privacy' => 'Files never leave your device. Encrypted PDFs cannot be processed.',
) );

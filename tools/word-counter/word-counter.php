<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
XPATSOFT_Registry::register( 'word-counter', array(
    'title' => 'Word & Character Counter',
    'description' => 'Live word count, reading time, keyword density and social platform limits. 100% in your browser.',
    'category' => 'Text',
    'icon' => 'dashicons-editor-textcolor',
    'version' => '1.1.0',
    'popular' => true,
    'keywords' => 'word counter character counter reading time keyword density',
    'instructions' => 'Paste or type text. Counts update live. Copy results or clear. No text leaves your device.',
    'faqs' => array(
        array( 'q' => 'Is my text sent to a server?', 'a' => 'No. All counting happens locally in your browser.' ),
        array( 'q' => 'Are platform limits exact?', 'a' => 'Platform limits change over time. We show current commonly-used limits as guidance, not guarantees.' ),
        array( 'q' => 'Does it handle other languages?', 'a' => 'Yes. Unicode-aware counting works for most scripts.' ),
    ),
    'privacy' => 'Your text never leaves your device.',
) );

<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
XPATSOFT_Registry::register( 'invoice-generator', array(
    'title' => 'Invoice & Receipt Generator',
    'description' => 'Create professional invoices and receipts with multi-currency support, Nigerian VAT preset and PDF export.',
    'category' => 'Business',
    'icon' => 'dashicons-media-document',
    'version' => '1.1.0',
    'popular' => true,
    'keywords' => 'invoice receipt generator vat ngn pdf',
    'instructions' => 'Enter business and customer details, add line items, set discount and tax, then preview, print or export PDF. All data stays in your browser.',
    'faqs' => array(
        array( 'q' => 'Is my business data stored?', 'a' => 'No. Everything runs locally in your browser. Nothing is sent to a server.' ),
        array( 'q' => 'Is the Nigerian VAT rate accurate?', 'a' => 'The 7.5% preset is editable. Verify current rates against official tax rules before issuing documents.' ),
        array( 'q' => 'How do I get a PDF?', 'a' => 'Use Download PDF (jsPDF) or Print / Save as PDF from your browser.' ),
    ),
    'privacy' => 'No server storage. This tool does not provide legal or tax advice.',
) );

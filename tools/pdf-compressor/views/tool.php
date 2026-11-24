<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>
<div class="xpatsoft-tool-wrap" id="tool-pdf-compressor">
  <div class="xpatsoft-tool-header"><h2 class="xpatsoft-tool-title">PDF Compressor</h2><p class="xpatsoft-tool-desc">Browser-local compression. Your file never leaves your device.</p></div>
  <div class="xpatsoft-panel">
    <div class="xpatsoft-drop" id="pdf-drop">Drag &amp; drop a PDF here or <input type="file" id="pdf-file" accept="application/pdf,.pdf"></div>
    <div class="xpatsoft-row" style="margin-top:12px">
      <div class="xpatsoft-field"><label for="pdf-mode">Compression mode</label>
        <select id="pdf-mode">
          <option value="optimise" selected>Optimise — text preserved (recommended)</option>
          <option value="rebuild">Rebuild — smallest size, text becomes image</option>
        </select></div>
      <div class="xpatsoft-field"><label for="pdf-quality">Quality preset</label>
        <select id="pdf-quality"><option value="high">High (best quality)</option><option value="medium" selected>Medium (balanced)</option><option value="low">Low (smallest)</option></select></div>
      <div class="xpatsoft-field"><label for="pdf-target">Target size (rebuild mode)</label>
        <select id="pdf-target"><option value="0">No target</option><option value="524288">500 KB</option><option value="1048576">1 MB</option><option value="2097152">2 MB</option><option value="5242880">5 MB</option></select></div>
    </div>
    <p style="font-size:.85rem;color:#555"><strong>Optimise mode</strong> copies pages with pdf-lib, preserves text, vectors, page sizes and metadata, compresses streams, and recompresses embedded JPEGs where possible. <strong>Rebuild mode</strong> renders pages to images for the smallest size, but text becomes non-selectable and non-searchable. Exact target sizes cannot be guaranteed; we return the best valid result. Encrypted PDFs cannot be processed.</p>
    <div class="xpatsoft-row">
      <button class="xpatsoft-btn" id="pdf-compress" disabled>Compress PDF</button>
      <button class="xpatsoft-btn secondary" id="pdf-download" disabled>Download compressed PDF</button>
      <button class="xpatsoft-btn secondary" id="pdf-reset">Reset</button>
    </div>
    <div id="pdf-status"></div>
    <progress id="pdf-progress" value="0" max="100" style="width:100%"></progress>
    <div class="xpatsoft-stats" id="pdf-stats"></div>
  </div>
  <div class="xpatsoft-panel"><h3>How it works</h3><p><strong>Optimise:</strong> pdf-lib copies your pages (text/vectors intact), preserves metadata, and saves with compressed object streams. Embedded JPEG images are recompressed where technically feasible. <strong>Rebuild:</strong> each page is rendered with pdf.js and rebuilt as JPEG images with pdf-lib — smaller, but text is no longer selectable.</p>
  <div class="xpatsoft-faq"><?php foreach ( $tool['faqs'] as $f ) : ?><details><summary><?php echo esc_html( $f['q'] ); ?></summary><p><?php echo esc_html( $f['a'] ); ?></p></details><?php endforeach; ?></div></div>
</div>

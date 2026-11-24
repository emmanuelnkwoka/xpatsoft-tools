<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>
<div class="xpatsoft-tool-wrap" id="tool-image-compressor">
  <div class="xpatsoft-tool-header"><h2 class="xpatsoft-tool-title">Image Compressor</h2><p class="xpatsoft-tool-desc">Batch compression with Canvas. Private by design.</p></div>
  <div class="xpatsoft-panel">
    <div class="xpatsoft-drop" id="img-drop">Drag &amp; drop images or <input type="file" id="img-files" accept="image/jpeg,image/png,image/webp" multiple></div>
    <div class="xpatsoft-row" style="margin-top:12px">
      <div class="xpatsoft-field"><label for="img-quality">Quality: <span id="img-quality-val">80</span>%</label><input type="range" id="img-quality" min="10" max="100" value="80"></div>
      <div class="xpatsoft-field"><label for="img-format">Output format</label><select id="img-format"><option value="same">Same as input</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></div>
    </div>
    <div class="xpatsoft-row">
      <button class="xpatsoft-btn" id="img-compress" disabled>Compress all</button>
      <button class="xpatsoft-btn secondary" id="img-zip" disabled>Download ZIP</button>
      <button class="xpatsoft-btn secondary" id="img-reset">Reset</button>
    </div>
    <div id="img-status"></div>
    <div id="img-list"></div>
  </div>
  <div class="xpatsoft-panel"><h3>How to use</h3><p>Add JPG, PNG or WebP images, adjust quality, compress, then download. Transparency is handled correctly per output format.</p>
  <div class="xpatsoft-faq"><?php foreach ( $tool['faqs'] as $f ) : ?><details><summary><?php echo esc_html( $f['q'] ); ?></summary><p><?php echo esc_html( $f['a'] ); ?></p></details><?php endforeach; ?></div></div>
</div>

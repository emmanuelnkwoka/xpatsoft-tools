<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>
<div class="xpatsoft-tool-wrap" id="tool-qr-code-generator">
  <div class="xpatsoft-tool-header">
    <h2 class="xpatsoft-tool-title">QR Code Generator</h2>
    <p class="xpatsoft-tool-desc">Static QR codes generated locally. No signup, no watermark, no expiry.</p>
  </div>
  <div class="xpatsoft-panel">
    <div class="xpatsoft-row">
      <div class="xpatsoft-field"><label for="qr-type">QR type</label>
        <select id="qr-type">
          <option value="url">URL</option><option value="text">Text</option><option value="whatsapp">WhatsApp</option>
          <option value="wifi">Wi-Fi</option><option value="email">Email</option><option value="phone">Phone</option><option value="vcard">vCard</option>
        </select>
      </div>
      <div class="xpatsoft-field"><label for="qr-size">Size (px)</label>
        <select id="qr-size"><option>256</option><option selected>512</option><option>1024</option></select>
      </div>
      <div class="xpatsoft-field"><label for="qr-ec">Error correction</label>
        <select id="qr-ec"><option value="L">L (7%)</option><option value="M" selected>M (15%)</option><option value="Q">Q (25%)</option><option value="H">H (30%)</option></select>
      </div>
    </div>
    <div id="qr-fields"></div>
    <div class="xpatsoft-row">
      <div class="xpatsoft-field"><label for="qr-fg">Foreground</label><input type="color" id="qr-fg" value="#000000"></div>
      <div class="xpatsoft-field"><label for="qr-bg">Background</label><input type="color" id="qr-bg" value="#ffffff"></div>
      <div class="xpatsoft-field"><label for="qr-logo">Logo (optional PNG/JPG)</label><input type="file" id="qr-logo" accept="image/png,image/jpeg"></div>
    </div>
    <div class="xpatsoft-row">
      <button class="xpatsoft-btn" id="qr-generate">Generate QR</button>
      <button class="xpatsoft-btn secondary" id="qr-download-png" disabled>Download PNG</button>
      <button class="xpatsoft-btn secondary" id="qr-download-svg" disabled>Download SVG</button>
      <button class="xpatsoft-btn secondary" id="qr-reset">Reset</button>
    </div>
    <div id="qr-error"></div>
    <div class="xpatsoft-qr-preview" id="qr-preview"><p>Preview will appear here.</p></div>
  </div>
  <div class="xpatsoft-panel">
    <h3>How to use</h3><p>Pick a type, fill the fields, generate, then download. For Wi-Fi, enter SSID and password. For WhatsApp, enter phone number and optional message. Keep high contrast for reliable scanning.</p>
    <h3>Privacy</h3><p>All generation is local. No data leaves your device.</p>
    <div class="xpatsoft-faq">
      <?php foreach ( $tool['faqs'] as $f ) : ?><details><summary><?php echo esc_html( $f['q'] ); ?></summary><p><?php echo esc_html( $f['a'] ); ?></p></details><?php endforeach; ?>
    </div>
  </div>
</div>

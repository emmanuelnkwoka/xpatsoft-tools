<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>
<div class="xpatsoft-tool-wrap" id="tool-word-counter">
  <div class="xpatsoft-tool-header"><h2 class="xpatsoft-tool-title">Word &amp; Character Counter</h2><p class="xpatsoft-tool-desc">Live counts, entirely private.</p></div>
  <div class="xpatsoft-panel">
    <div class="xpatsoft-field"><label for="wc-text">Your text</label><textarea id="wc-text" rows="8" placeholder="Start typing or paste text..."></textarea></div>
    <div class="xpatsoft-row" style="margin-top:10px">
      <button class="xpatsoft-btn secondary" id="wc-copy">Copy result</button>
      <button class="xpatsoft-btn secondary" id="wc-clear">Clear text</button>
    </div>
    <div class="xpatsoft-stats" id="wc-stats"></div>
    <h3>Top words</h3><div id="wc-top"></div>
    <h3>Platform limits</h3>
    <div class="xpatsoft-field"><label for="wc-platform">Platform</label>
      <select id="wc-platform"><option value="280">X / Twitter (280)</option><option value="2200">LinkedIn post (3,000)</option><option value="150">Instagram caption guidance (2,200)</option><option value="160">SMS segment (160)</option></select></div>
    <p id="wc-platform-note" style="font-size:.85rem;color:#555"></p>
  </div>
  <div class="xpatsoft-panel"><h3>How to use</h3><p>Type or paste. All metrics update instantly. Platform limits are estimates based on commonly published values and may change.</p>
  <div class="xpatsoft-faq"><?php foreach ( $tool['faqs'] as $f ) : ?><details><summary><?php echo esc_html( $f['q'] ); ?></summary><p><?php echo esc_html( $f['a'] ); ?></p></details><?php endforeach; ?></div></div>
</div>

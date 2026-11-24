<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>
<div class="xpatsoft-tool-wrap" id="tool-invoice-generator">
  <div class="xpatsoft-tool-header"><h2 class="xpatsoft-tool-title">Invoice &amp; Receipt Generator</h2><p class="xpatsoft-tool-desc">Professional documents, calculated locally. No signup.</p></div>
  <div class="xpatsoft-panel">
    <div class="xpatsoft-row">
      <div class="xpatsoft-field"><label for="inv-mode">Mode</label><select id="inv-mode"><option value="invoice">Invoice</option><option value="receipt">Receipt</option></select></div>
      <div class="xpatsoft-field"><label for="inv-currency">Currency</label>
        <select id="inv-currency"><option value="NGN">NGN (₦)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option><option value="EUR">EUR (€)</option><option value="GHS">GHS (GH₵)</option><option value="KES">KES (KSh)</option><option value="ZAR">ZAR (R)</option></select></div>
      <div class="xpatsoft-field"><label for="inv-number">Number</label><input id="inv-number" value="INV-001"></div>
    </div>
    <h3>Business</h3>
    <div class="xpatsoft-row">
      <div class="xpatsoft-field"><label>Business name</label><input id="biz-name" value="My Business Ltd"></div>
      <div class="xpatsoft-field"><label>Email</label><input id="biz-email" type="email" value="hello@example.com"></div>
      <div class="xpatsoft-field"><label>Phone</label><input id="biz-phone" value="+234 800 000 0000"></div>
    </div>
    <div class="xpatsoft-row">
      <div class="xpatsoft-field"><label>Address</label><input id="biz-addr" value="Lagos, Nigeria"></div>
      <div class="xpatsoft-field"><label>Bank details</label><input id="biz-bank" value="Bank: XXX, Acc: 0000000000"></div>
      <div class="xpatsoft-field"><label>Logo (optional)</label><input id="biz-logo" type="file" accept="image/*"></div>
    </div>
    <h3>Customer</h3>
    <div class="xpatsoft-row">
      <div class="xpatsoft-field"><label>Name</label><input id="cust-name" value="Customer Name"></div>
      <div class="xpatsoft-field"><label>Email</label><input id="cust-email" type="email" value="customer@example.com"></div>
      <div class="xpatsoft-field"><label>Address</label><input id="cust-addr" value="Customer Address"></div>
    </div>
    <div class="xpatsoft-row">
      <div class="xpatsoft-field"><label>Invoice date</label><input id="inv-date" type="date"></div>
      <div class="xpatsoft-field"><label>Due date</label><input id="inv-due" type="date"></div>
      <div class="xpatsoft-field"><label>Payment method (receipt)</label><input id="inv-paymethod" value="Bank transfer"></div>
    </div>
    <h3>Items</h3>
    <div id="inv-items"></div>
    <button class="xpatsoft-btn secondary" id="inv-add-item">+ Add item</button>
    <div class="xpatsoft-row" style="margin-top:12px">
      <div class="xpatsoft-field"><label>Discount (%)</label><input id="inv-discount" type="number" min="0" max="100" step="0.01" value="0"></div>
      <div class="xpatsoft-field"><label>Tax / VAT (%)</label><input id="inv-tax" type="number" min="0" step="0.01" value="7.5"></div>
      <div class="xpatsoft-field"><label>Amount paid (receipt)</label><input id="inv-paid" type="number" min="0" step="0.01" value="0"></div>
    </div>
    <p style="font-size:.85rem;color:#555">Nigerian VAT preset 7.5% is editable. Verify current rates against official tax rules. This tool does not provide legal or tax advice.</p>
    <div class="xpatsoft-field"><label>Notes</label><textarea id="inv-notes" rows="2">Thank you for your business.</textarea></div>
    <div class="xpatsoft-row" style="margin-top:12px">
      <button class="xpatsoft-btn" id="inv-preview-btn">Preview</button>
      <button class="xpatsoft-btn secondary" id="inv-print">Print / Save PDF</button>
      <button class="xpatsoft-btn secondary" id="inv-download">Download PDF</button>
      <button class="xpatsoft-btn secondary" id="inv-whatsapp">WhatsApp share</button>
      <button class="xpatsoft-btn secondary" id="inv-clear">Clear</button>
    </div>
  </div>
  <div class="xpatsoft-panel xpatsoft-print-area" id="inv-preview"><p>Preview will appear here.</p></div>
  <div class="xpatsoft-panel"><h3>Privacy</h3><p>All calculations happen in your browser. No business or customer data is stored on a server.</p>
  <div class="xpatsoft-faq"><?php foreach ( $tool['faqs'] as $f ) : ?><details><summary><?php echo esc_html( $f['q'] ); ?></summary><p><?php echo esc_html( $f['a'] ); ?></p></details><?php endforeach; ?></div></div>
</div>

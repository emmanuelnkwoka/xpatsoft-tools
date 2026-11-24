<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>
<div class="wrap xpatsoft-admin-wrap">
  <h1>XPATSOFT Tools</h1>
  <p><?php echo esc_html( XPATSOFT_Helpers::get_option( 'tagline', '' ) ); ?> &mdash; v<?php echo esc_html( XPATSOFT_TOOLS_VERSION ); ?></p>
  <?php if ( isset( $_GET['saved'] ) ) : ?><div class="notice notice-success"><p>Settings saved.</p></div><?php endif; ?>
  <div class="xpatsoft-admin-cards">
    <div class="xpatsoft-admin-card"><b><?php echo esc_html( XPATSOFT_Registry::count() ); ?></b>Total tools</div>
    <div class="xpatsoft-admin-card"><b><?php echo esc_html( count( $active ) ); ?></b>Active tools</div>
    <div class="xpatsoft-admin-card"><b><?php echo esc_html( XPATSOFT_Registry::count() - count( $active ) ); ?></b>Inactive tools</div>
    <div class="xpatsoft-admin-card"><b><?php echo esc_html( count( XPATSOFT_Registry::categories() ) ); ?></b>Categories</div>
  </div>
  <h2>Modules</h2>
  <table class="xpatsoft-admin-table">
    <thead><tr><th>Tool</th><th>Category</th><th>Version</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>
    <?php foreach ( $tools as $id => $t ) : $on = XPATSOFT_Helpers::is_tool_active( $id ); ?>
      <tr>
        <td><strong><?php echo esc_html( $t['title'] ); ?></strong><br><code><?php echo esc_html( $id ); ?></code></td>
        <td><?php echo esc_html( $t['category'] ); ?></td>
        <td><?php echo esc_html( $t['version'] ); ?></td>
        <td><span class="xpatsoft-badge <?php echo esc_attr( $on ? 'on' : 'off' ); ?>"><?php echo esc_html( $on ? 'Active' : 'Inactive' ); ?></span></td>
        <td>
          <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
            <?php XPATSOFT_Security::nonce_field(); ?>
            <input type="hidden" name="action" value="xpatsoft_toggle_tool">
            <input type="hidden" name="tool_id" value="<?php echo esc_attr( $id ); ?>">
            <input type="hidden" name="active" value="<?php echo esc_attr( $on ? '0' : '1' ); ?>">
            <button class="button"><?php echo esc_html( $on ? 'Deactivate' : 'Activate' ); ?></button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <h2>Settings</h2>
  <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
    <?php XPATSOFT_Security::nonce_field(); ?>
    <input type="hidden" name="action" value="xpatsoft_save_settings">
    <table class="form-table">
      <tr><th>Tagline</th><td><input type="text" name="xpatsoft_tagline" value="<?php echo esc_attr( XPATSOFT_Helpers::get_option( 'tagline', '' ) ); ?>" class="regular-text"></td></tr>
      <tr><th>Privacy note</th><td><textarea name="xpatsoft_privacy_note" rows="3" class="large-text"><?php echo esc_textarea( XPATSOFT_Helpers::get_option( 'privacy_note', '' ) ); ?></textarea></td></tr>
    </table>
    <button class="button button-primary">Save settings</button>
  </form>
  <h2>System diagnostics</h2>
  <table class="xpatsoft-admin-table">
    <tr><th>PHP</th><td><?php echo esc_html( phpversion() ); ?></td></tr>
    <tr><th>WordPress</th><td><?php echo esc_html( get_bloginfo( 'version' ) ); ?></td></tr>
    <tr><th>Plugin version</th><td><?php echo esc_html( XPATSOFT_TOOLS_VERSION ); ?></td></tr>
    <tr><th>Debug log</th><td><code><?php echo esc_html( WP_CONTENT_DIR . '/debug.log' ); ?></code></td></tr>
  </table>
  <h2>Shortcodes</h2>
  <p><code>[xpatsoft_tools]</code> &mdash; directory</p>
  <?php foreach ( $tools as $id => $t ) : ?><p><code>[xpatsoft_tool id="<?php echo esc_attr( $id ); ?>"]</code> &mdash; <?php echo esc_html( $t['title'] ); ?></p><?php endforeach; ?>
</div>

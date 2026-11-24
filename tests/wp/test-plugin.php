<?php
/**
 * WordPress integration tests.
 * These run against real WordPress in CI; they verify registration,
 * shortcodes, activation defaults and module isolation.
 */
class XPATSOFT_WP_Test extends WP_UnitTestCase {

	public function test_plugin_classes_loaded() {
		$this->assertTrue( class_exists( 'XPATSOFT_Registry' ), 'Registry class loaded' );
		$this->assertTrue( class_exists( 'XPATSOFT_Security' ), 'Security class loaded' );
		$this->assertTrue( class_exists( 'XPATSOFT_Assets' ), 'Assets class loaded' );
		$this->assertTrue( class_exists( 'XPATSOFT_Shortcodes' ), 'Shortcodes class loaded' );
	}

	public function test_all_five_tools_register() {
		$all = XPATSOFT_Registry::all();
		$this->assertIsArray( $all );
		$this->assertCount( 5, $all, 'Exactly five tools registered' );
		foreach ( array( 'qr-code-generator', 'invoice-generator', 'pdf-compressor', 'image-compressor', 'word-counter' ) as $id ) {
			$this->assertArrayHasKey( $id, $all, "Tool '$id' registered" );
			$this->assertNotEmpty( $all[ $id ]['title'], "Tool '$id' has a title" );
			$this->assertNotEmpty( $all[ $id ]['category'], "Tool '$id' has a category" );
		}
	}

	public function test_shortcodes_registered() {
		$this->assertTrue( shortcode_exists( 'xpatsoft_tools' ), '[xpatsoft_tools] registered' );
		$this->assertTrue( shortcode_exists( 'xpatsoft_tool' ), '[xpatsoft_tool] registered' );
	}

	public function test_directory_shortcode_renders_escaped_html() {
		$html = do_shortcode( '[xpatsoft_tools]' );
		$this->assertStringContainsString( 'QR Code Generator', $html );
		$this->assertStringContainsString( 'Invoice', $html );
		$this->assertStringNotContainsString( '<script>alert', $html, 'No raw script injection in directory output' );
	}

	public function test_single_tool_shortcode_renders() {
		$html = do_shortcode( '[xpatsoft_tool id="word-counter"]' );
		$this->assertStringContainsString( 'Word', $html );
	}

	public function test_shortcode_rejects_unknown_tool() {
		$html = do_shortcode( '[xpatsoft_tool id="../../etc/passwd"]' );
		$this->assertStringNotContainsString( 'passwd', $html, 'Unknown/unsafe ids produce no output' );
	}

	public function test_shortcode_isolates_inactive_tool() {
		update_option( 'xpatsoft_tools_active', array( 'word-counter' ) );
		$html = do_shortcode( '[xpatsoft_tool id="qr-code-generator"]' );
		update_option( 'xpatsoft_tools_active', array( 'qr-code-generator', 'invoice-generator', 'pdf-compressor', 'image-compressor', 'word-counter' ) );
		$this->assertStringNotContainsString( 'qr-preview', $html, 'Inactive tool does not render its UI' );
	}

	public function test_deactivating_one_tool_leaves_others_working() {
		update_option( 'xpatsoft_tools_active', array( 'invoice-generator', 'pdf-compressor', 'image-compressor', 'word-counter' ) );
		$qr    = do_shortcode( '[xpatsoft_tool id="qr-code-generator"]' );
		$words = do_shortcode( '[xpatsoft_tool id="word-counter"]' );
		update_option( 'xpatsoft_tools_active', array( 'qr-code-generator', 'invoice-generator', 'pdf-compressor', 'image-compressor', 'word-counter' ) );
		$this->assertStringNotContainsString( 'qr-preview', $qr, 'Deactivated module renders nothing' );
		$this->assertStringContainsString( 'id="wc-text"', $words, 'Other modules keep rendering (module isolation)' );
	}

	public function test_settings_round_trip() {
		XPATSOFT_Helpers::set_option( 'accent', '#2271b1' );
		$this->assertSame( '#2271b1', XPATSOFT_Helpers::get_option( 'accent' ), 'Setting persists' );
		XPATSOFT_Helpers::set_option( 'accent', '<script>bad</script>' );
		$this->assertSame( '<script>bad</script>', XPATSOFT_Helpers::get_option( 'accent' ), 'Helpers store raw; escaping happens at output' );
		delete_option( 'xpatsoft_tools_settings' );
	}

	public function test_vendor_files_have_licenses() {
		$base = dirname( __DIR__, 2 ) . '/assets/vendor/';
		foreach ( array( 'pdf-lib', 'pdfjs-dist', 'jszip', 'jspdf', 'html2canvas', 'qrcode-generator' ) as $dir ) {
			$files = glob( $base . $dir . '/LICENSE*' );
			$this->assertNotEmpty( $files, "License notice present for $dir" );
		}
	}

	public function test_activation_sets_defaults() {
		delete_option( 'xpatsoft_tools_active' );
		XPATSOFT_Tools::activate();
		$active = get_option( 'xpatsoft_tools_active' );
		$this->assertIsArray( $active );
		$this->assertCount( 5, $active, 'All five tools active by default' );
	}

	public function test_capability_helper_denies_anonymous_users() {
		wp_set_current_user( 0 );
		$this->assertFalse( XPATSOFT_Security::can_manage(), 'Anonymous user cannot manage tools' );
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );
		$this->assertTrue( XPATSOFT_Security::can_manage(), 'Administrator can manage tools' );
	}

	public function test_assets_only_load_for_active_tool_shortcode() {
		$html = do_shortcode( '[xpatsoft_tool id="qr-code-generator"]' );
		$this->assertNotNull( $html );
		$scripts = wp_scripts()->registered;
		$this->assertArrayHasKey( 'xpatsoft-utils', $scripts, 'Shared utils script registered' );
		$this->assertArrayHasKey( 'qrcode-generator', $scripts, 'QR vendor script registered from plugin' );
	}

	public function test_vendor_libraries_are_local() {
		$asset_src = file_get_contents( dirname( __DIR__, 2 ) . '/includes/class-xpatsoft-assets.php' );
		$this->assertStringNotContainsString( 'jsdelivr', $asset_src, 'No CDN dependency' );
		$this->assertFileExists( dirname( __DIR__, 2 ) . '/assets/vendor/pdf-lib/pdf-lib.min.js' );
		$this->assertFileExists( dirname( __DIR__, 2 ) . '/assets/vendor/qrcode-generator/qrcode.js' );
	}

	public function test_helpers_format_and_sanitise() {
		$this->assertSame( '1.0 KB', XPATSOFT_Helpers::format_bytes( 1024 ) );
		$this->assertSame( 'xss', XPATSOFT_Helpers::sanitize_id( '<script>xss</script>' ) );
		$this->assertSame( 'my-tool', XPATSOFT_Helpers::sanitize_id( 'My Tool' ) );
	}
}

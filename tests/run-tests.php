<?php
// Standalone PHP test runner — stubs minimal WP functions, no WP install needed.
error_reporting( E_ALL );
$pass=0; $fail=0;
function ok($cond,$msg){ global $pass,$fail; if($cond){$pass++; echo "PASS: $msg\n";} else {$fail++; echo "FAIL: $msg\n";} }

// --- WP stubs ---
$GLOBALS['__opts']=array();
function get_option($k,$d=false){ return $GLOBALS['__opts'][$k] ?? $d; }
function update_option($k,$v){ $GLOBALS['__opts'][$k]=$v; return true; }
function sanitize_key($k){ return strtolower(preg_replace('/[^a-zA-Z0-9_\-]/','',$k)); }
function sanitize_text_field($s){ return trim(strip_tags((string)$s)); }
function sanitize_textarea_field($s){ return trim(strip_tags((string)$s)); }
function wp_parse_args($a,$d){ return array_merge($d,(array)$a); }
function esc_html__($s,$d=null){ return $s; }
function esc_html($s){ return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8'); }
function esc_attr($s){ return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8'); }
function esc_url($s){ return $s; }
function esc_textarea($s){ return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8'); }
function wp_unslash($v){ return $v; }
function current_user_can($c){ return true; }
function wp_verify_nonce($n,$a){ return true; }
function wp_nonce_field($a,$n){ return ''; }
function wp_create_nonce($a){ return 'testnonce'; }
function admin_url($p=''){ return 'https://example.test/wp-admin/'.$p; }
function plugin_dir_path($f){ return dirname($f).'/'; }
function plugin_dir_url($f){ return 'https://example.test/wp-content/plugins/xpatsoft-tools/'; }
function add_action(){}
function add_shortcode(){}
function register_activation_hook(){}
function register_deactivation_hook(){}
function is_admin(){ return false; }
function wp_register_style(){}
function wp_register_script(){}
function wp_enqueue_style(){}
function wp_enqueue_script(){}
function wp_localize_script(){}
function shortcode_atts($d,$a,$t=''){ return array_merge($d,(array)$a); }
function wp_die($m){ throw new Exception($m); }
function wp_safe_redirect($u){ throw new Exception('redirect:'.$u); }
function get_bloginfo($k){ return '6.8'; }
function wp_check_filetype_and_ext($t,$n,$m){ return array('ext'=>'pdf'); }
function is_uploaded_file($f){ return true; }
class WP_Error{ public $code; public $msg; function __construct($c,$m){$this->code=$c;$this->msg=$m;} }
define('ABSPATH','/tmp/');
define('XPATSOFT_TOOLS_VERSION','1.1.0');
define('XPATSOFT_TOOLS_FILE', __DIR__.'/../xpatsoft-tools.php');
define('XPATSOFT_TOOLS_PATH', __DIR__.'/../');
define('XPATSOFT_TOOLS_URL','https://example.test/wp-content/plugins/xpatsoft-tools/');

$base = __DIR__.'/../';

// 1. Files exist
foreach ( array('xpatsoft-tools.php','includes/class-xpatsoft-helpers.php','includes/class-xpatsoft-registry.php','includes/class-xpatsoft-security.php','includes/class-xpatsoft-assets.php','includes/class-xpatsoft-shortcodes.php','includes/class-xpatsoft-admin.php','includes/class-xpatsoft-tools.php','templates/directory.php','admin/views/dashboard.php','assets/css/xpatsoft-tools.css','assets/js/xpatsoft-tools.js') as $f ) {
    ok( file_exists($base.$f), "file exists: $f" );
}

// 2. Load classes
require $base.'includes/class-xpatsoft-helpers.php';
require $base.'includes/class-xpatsoft-registry.php';
require $base.'includes/class-xpatsoft-security.php';
require $base.'includes/class-xpatsoft-assets.php';
require $base.'includes/class-xpatsoft-shortcodes.php';
require $base.'includes/class-xpatsoft-admin.php';
require $base.'includes/class-xpatsoft-tools.php';

// 3. Registry: load all tools
XPATSOFT_Registry::init();
$tools = XPATSOFT_Registry::all();
ok( count($tools)===5, 'registry has 5 tools (got '.count($tools).')' );
foreach ( array('qr-code-generator','invoice-generator','pdf-compressor','image-compressor','word-counter') as $id ) {
    ok( isset($tools[$id]), "tool registered: $id" );
    if ( isset($tools[$id]) ) {
        foreach ( array('title','description','category','instructions','faqs','privacy') as $k ) {
            ok( !empty($tools[$id][$k]), "$id has $k" );
        }
        ok( file_exists($base."tools/$id/views/tool.php"), "$id view exists" );
        ok( file_exists($base."tools/$id/assets/js/$id.js"), "$id JS exists" );
        ok( file_exists($base."tools/$id/assets/css/$id.css"), "$id CSS exists" );
    }
}

// 4. Helpers
ok( XPATSOFT_Helpers::format_bytes(0)==='0 B', 'format_bytes 0' );
ok( strpos(XPATSOFT_Helpers::format_bytes(2048),'KB')!==false, 'format_bytes KB' );
ok( XPATSOFT_Helpers::sanitize_id('QR Code!')==='qrcode', 'sanitize_id strips' );
XPATSOFT_Helpers::set_tool_active('word-counter', false);
ok( !XPATSOFT_Helpers::is_tool_active('word-counter'), 'deactivate word-counter' );
XPATSOFT_Helpers::set_tool_active('word-counter', true);
ok( XPATSOFT_Helpers::is_tool_active('word-counter'), 'reactivate word-counter' );

// 5. Security
ok( XPATSOFT_Security::can_manage()===true, 'can_manage true (stub)' );
ok( XPATSOFT_Security::sanitize_text('<b>hi</b>')==='hi', 'sanitize_text strips tags' );

// 6. Shortcodes registered (methods exist)
ok( method_exists('XPATSOFT_Shortcodes','render_directory'), 'render_directory exists' );
ok( method_exists('XPATSOFT_Shortcodes','render_tool'), 'render_tool exists' );

// 7. Static checks: no eval, no secrets
$all = '';
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS));
foreach ( $it as $f ) { if ( $f->isFile() && substr($f->getFilename(),-4)==='.php' && strpos($f->getPathname(),'/tests/')===false ) $all .= file_get_contents($f->getPathname()); }
// Split the needle so this assertion cannot match its own source line.
$eval_needle = 'ev' . 'al' . chr( 40 );
ok( strpos($all,$eval_needle)===false, 'no dynamic code execution' );
ok( !preg_match('/(api[_-]?key|password|secret)\s*=\s*['"][A-Za-z0-9]{16,}/i',$all), 'no hardcoded secrets' );
ok( strpos($all,'manage_options')!==false, 'capability check present' );
ok( strpos($all,'wp_verify_nonce')!==false, 'nonce check present' );
ok( strpos($all,'esc_html')!==false, 'escaping present' );

// 8. PHP lint all files
$lintFail=0;
$it2 = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS));
foreach ( $it2 as $f ) { if ( $f->isFile() && substr($f->getFilename(),-4)==='.php' ) { exec('php -l '.escapeshellarg($f->getPathname()).' 2>&1', $o, $c); if($c!==0){$lintFail++; echo "LINT FAIL: ".$f->getPathname()."\n";} } }
ok( $lintFail===0, 'php -l all files' );

echo "\nResults: $pass passed, $fail failed\n";
exit($fail>0?1:0);

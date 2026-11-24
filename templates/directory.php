<?php if ( ! defined( 'ABSPATH' ) ) { exit; }
$tagline = XPATSOFT_Helpers::get_option( 'tagline', 'FREE. PRIVATE. USEFUL. NO UNNECESSARY SIGNUP.' );
$cats = XPATSOFT_Registry::categories();
$popular = array_filter( $tools, function( $t ) { return ! empty( $t['popular'] ); } );
?>
<div class="xpatsoft-directory" id="xpatsoft-directory">
  <div class="xpatsoft-hero">
    <h2 class="xpatsoft-hero-title">XPATSOFT TOOLS</h2>
    <p class="xpatsoft-hero-tagline"><?php echo esc_html( $tagline ); ?></p>
    <div class="xpatsoft-search-wrap">
      <input type="search" id="xpatsoft-search" class="xpatsoft-search" placeholder="Search tools..." aria-label="Search tools">
    </div>
    <div class="xpatsoft-filters" role="group" aria-label="Category filters">
      <button class="xpatsoft-filter is-active" data-cat="all">All</button>
      <?php foreach ( $cats as $c ) : ?>
        <button class="xpatsoft-filter" data-cat="<?php echo esc_attr( $c ); ?>"><?php echo esc_html( $c ); ?></button>
      <?php endforeach; ?>
    </div>
  </div>
  <?php if ( ! empty( $popular ) ) : ?>
  <div class="xpatsoft-popular">
    <h3>Popular tools</h3>
    <div class="xpatsoft-grid">
      <?php foreach ( $popular as $id => $t ) : ?>
        <a class="xpatsoft-card" href="#tool-<?php echo esc_attr( $id ); ?>" data-cat="<?php echo esc_attr( $t['category'] ); ?>" data-search="<?php echo esc_attr( strtolower( $t['title'] . ' ' . $t['description'] . ' ' . $t['keywords'] ) ); ?>">
          <span class="dashicons <?php echo esc_attr( $t['icon'] ); ?> xpatsoft-card-icon"></span>
          <span class="xpatsoft-card-title"><?php echo esc_html( $t['title'] ); ?></span>
          <span class="xpatsoft-card-desc"><?php echo esc_html( $t['description'] ); ?></span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
  <?php endif; ?>
  <div class="xpatsoft-grid" id="xpatsoft-grid">
    <?php foreach ( $tools as $id => $t ) : ?>
      <a class="xpatsoft-card" href="#tool-<?php echo esc_attr( $id ); ?>" data-cat="<?php echo esc_attr( $t['category'] ); ?>" data-search="<?php echo esc_attr( strtolower( $t['title'] . ' ' . $t['description'] . ' ' . $t['keywords'] ) ); ?>">
        <span class="dashicons <?php echo esc_attr( $t['icon'] ); ?> xpatsoft-card-icon"></span>
        <span class="xpatsoft-card-title"><?php echo esc_html( $t['title'] ); ?></span>
        <span class="xpatsoft-card-desc"><?php echo esc_html( $t['description'] ); ?></span>
        <span class="xpatsoft-card-cat"><?php echo esc_html( $t['category'] ); ?></span>
      </a>
    <?php endforeach; ?>
  </div>
  <p class="xpatsoft-privacy-note"><?php echo esc_html( XPATSOFT_Helpers::get_option( 'privacy_note', 'All tools run in your browser. Your files never leave your device.' ) ); ?></p>
</div>

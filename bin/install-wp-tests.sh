#!/usr/bin/env bash
# Install the WordPress core test suite (PHPUnit) for plugin integration tests.
# Usage: bin/install-wp-tests.sh <db-name> <db-user> <db-pass> [db-host] [wp-version]
# Modelled on the WordPress core `install-wp-tests.sh` scaffold, but written to
# fail loudly and never pipe a network download into tar.
set -euo pipefail

DB_NAME="${1:-wordpress_test}"
DB_USER="${2:-root}"
DB_PASS="${3:-root}"
DB_HOST="${4:-127.0.0.1}"
WP_VERSION="${5:-latest}"

WP_TESTS_DIR="${WP_TESTS_DIR:-/tmp/wordpress-tests-lib}"
WP_CORE_DIR="${WP_CORE_DIR:-/tmp/wordpress}"
WORK_DIR="$(mktemp -d)"

cleanup() { rm -rf "${WORK_DIR}"; }
trap cleanup EXIT

if [ "${WP_VERSION}" = "latest" ]; then
  # Resolve the newest stable tag from the public WordPress.org API (fallback: 6.7).
  if raw="$(curl -fsSL 'https://api.wordpress.org/core/version-check/1.7/' 2>/dev/null)"; then
    resolved="$(printf '%s' "$raw" | tr ',' '\n' | grep -m1 '"current"' | sed -E 's/.*"current":"([0-9.]+)".*/\1/')"
    WP_VERSION="${resolved:-6.7}"
  else
    WP_VERSION="6.7"
  fi
fi
echo "WordPress version: ${WP_VERSION}"

mkdir -p "${WP_TESTS_DIR}" "${WP_CORE_DIR}"

# 1. Core install (only used for ABSPATH in the test config).
echo "Downloading WordPress core..."
curl -fsSL -o "${WORK_DIR}/wordpress.tar.gz" "https://wordpress.org/wordpress-${WP_VERSION}.tar.gz"
tar -C "${WP_CORE_DIR}" --strip-components=1 -xzf "${WORK_DIR}/wordpress.tar.gz"

# 2. Test library from wordpress-develop.
echo "Downloading wordpress-develop test library..."
if curl -fsSL -o "${WORK_DIR}/develop.tar.gz" \
     "https://github.com/WordPress/wordpress-develop/archive/refs/tags/${WP_VERSION}.tar.gz"; then
  tar -C "${WORK_DIR}" -xzf "${WORK_DIR}/develop.tar.gz"
  SRC="${WORK_DIR}/wordpress-develop-${WP_VERSION}/tests/phpunit"
else
  echo "Tag tarball unavailable; falling back to the develop branch."
  curl -fsSL -o "${WORK_DIR}/develop.tar.gz" \
    "https://github.com/WordPress/wordpress-develop/archive/refs/heads/trunk.tar.gz"
  tar -C "${WORK_DIR}" -xzf "${WORK_DIR}/develop.tar.gz"
  SRC="${WORK_DIR}/wordpress-develop-trunk/tests/phpunit"
fi

if [ ! -d "${SRC}/includes" ]; then
  echo "ERROR: could not locate tests/phpunit/includes in the downloaded archive." >&2
  exit 1
fi

rm -rf "${WP_TESTS_DIR}/includes" "${WP_TESTS_DIR}/data"
cp -r "${SRC}/includes" "${WP_TESTS_DIR}/includes"
[ -d "${SRC}/data" ] && cp -r "${SRC}/data" "${WP_TESTS_DIR}/data"

POLYFILLS_PATH="${WP_TESTS_PHPUNIT_POLYFILLS_PATH:-}"

cat > "${WP_TESTS_DIR}/wp-tests-config.php" <<CONFIG
<?php
define( 'DB_NAME', '${DB_NAME}' );
define( 'DB_USER', '${DB_USER}' );
define( 'DB_PASSWORD', '${DB_PASS}' );
define( 'DB_HOST', '${DB_HOST}' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );
define( 'ABSPATH', '${WP_CORE_DIR}/' );
define( 'WP_TESTS_DOMAIN', 'example.org' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'XPATSOFT Tests' );
define( 'WP_PHP_BINARY', 'php' );
define( 'WPLANG', '' );
define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', '${POLYFILLS_PATH}' );
CONFIG

echo "WordPress test library ready at ${WP_TESTS_DIR}"

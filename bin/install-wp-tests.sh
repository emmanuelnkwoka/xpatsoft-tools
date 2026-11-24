#!/usr/bin/env bash
# Install the WordPress core test suite (standard WordPress test scaffolding).
# Usage: bin/install-wp-tests.sh <db-name> <db-user> <db-pass> [db-host] [wp-version]
set -euo pipefail
DB_NAME="${1:-wordpress_test}"
DB_USER="${2:-root}"
DB_PASS="${3:-root}"
DB_HOST="${4:-127.0.0.1}"
WP_VERSION="${5:-latest}"
WP_TESTS_DIR="${WP_TESTS_DIR:-/tmp/wordpress-tests-lib}"
WP_CORE_DIR="${WP_CORE_DIR:-/tmp/wordpress}"

if [ "${WP_VERSION}" = "latest" ]; then
  WP_VERSION=$(curl -sL https://api.github.com/repos/WordPress/WordPress/tags \
    | grep -m1 '"name"' | sed -E 's/.*"([0-9.]+)".*/\1/')
fi

echo "Installing WordPress ${WP_VERSION} test library into ${WP_TESTS_DIR}"
mkdir -p "${WP_TESTS_DIR}" "${WP_CORE_DIR}"

curl -sL "https://wordpress.org/wordpress-${WP_VERSION}.tar.gz" | tar -C "${WP_CORE_DIR}" --strip-components=1 -zx
curl -sL "https://github.com/WordPress/wordpress-develop/archive/refs/tags/${WP_VERSION}.tar.gz" | tar -C /tmp -zx
cp -r "/tmp/wordpress-develop-${WP_VERSION}/tests/phpunit/includes" "${WP_TESTS_DIR}/includes"
cp -r "/tmp/wordpress-develop-${WP_VERSION}/tests/phpunit/data" "${WP_TESTS_DIR}/data"
cp "/tmp/wordpress-develop-${WP_VERSION}/wp-tests-config-sample.php" "${WP_TESTS_DIR}/wp-tests-config-sample.php"

cat > "${WP_TESTS_DIR}/wp-tests-config.php" <<CONFIG
<?php
define( 'DB_NAME', '${DB_NAME}' );
define( 'DB_USER', '${DB_USER}' );
define( 'DB_PASSWORD', '${DB_PASS}' );
define( 'DB_HOST', '${DB_HOST}' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );
define( 'ABSPATH', '${WP_CORE_DIR}/' );
CONFIG

echo "WordPress test library ready at ${WP_TESTS_DIR}"

#!/bin/sh
composer install
php -S 0.0.0.0:80 -t public public/index.php

<?php
$h = fopen('database/data/phrases_idioms.csv', 'r');
fgetcsv($h);
$map = [];
$dupes = 0;
while(($r = fgetcsv($h)) !== false) {
    $k = ($r[12] ?? '') . '|' . ($r[1] ?? '');
    if(isset($map[$k])) {
        echo "Duplicate: " . $k . PHP_EOL;
        $dupes++;
    }
    $map[$k] = 1;
}
echo "Total duplicates: " . $dupes . PHP_EOL;
fclose($h);

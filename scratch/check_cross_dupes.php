<?php
$h = fopen('database/data/phrases_idioms.csv', 'r');
fgetcsv($h);
$map = [];
while(($r = fgetcsv($h)) !== false) {
    $word = $r[1];
    $sublist = $r[12];
    if(isset($map[$word]) && $map[$word] !== $sublist) {
        echo "Cross-list duplicate: [" . $word . "] in [" . $map[$word] . "] AND [" . $sublist . "]" . PHP_EOL;
    }
    $map[$word] = $sublist;
}
fclose($h);

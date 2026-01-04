<pre>
$_ENV
<?php print_r($_ENV); ?>
</pre>
<pre>
$_SERVER
<?php print_r($_SERVER); ?>
</pre>
<pre>
php://input
<?php
$input = file_get_contents("php://input");
if (strlen($input) > 0) {
    $data = json_decode($input);
    print_r($data);
}
?>
</pre>
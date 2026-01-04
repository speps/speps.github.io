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
<?php print(htmlspecialchars(file_get_contents("php://input"))); ?>
</pre>
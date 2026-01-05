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
<pre>
exec
<?php
// outputs the username that owns the running php/httpd process
// (on a system with the "whoami" executable in the path)
$output=null;
$retval=null;
exec('./qjs', $output, $retval);
echo "Returned with status $retval and output:\n";
print_r($output);
?>
</pre>
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
FFI
<?php
// create FFI object, loading libc and exporting function printf()
$ffi = FFI::cdef(
    "int printf(const char *format, ...);", // this is a regular C declaration
    "libc.so.6");
// call C's printf()
$ffi->printf("Hello %s!\n", "world");
?>
</pre>
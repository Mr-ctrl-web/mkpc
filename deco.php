<?php
session_start();
session_destroy();
setcookie('mkp', null, 0,'/');
?>
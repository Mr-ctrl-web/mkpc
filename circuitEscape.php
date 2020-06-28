<?php
function escapeCircuitNames($str) {
	return preg_replace_callback("#(%u[0-9a-fA-F]{4})+#", function($matches) {
		return json_decode('"'.str_replace('%', '\\', $matches[0]).'"');
	}, $str);
}
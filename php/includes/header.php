<?php
require_once('advent-topic.php');
?>
<header role="banner">
	<table>
		<tr>
			<td id="header_left">
				<img src="<?php echo $adventEnabled ? 'images/header_lwinter.png' : 'images/pages/header-left.png'; ?>" alt="/|" />
			</td>
			<td id="header_center">
				<?php
				if ($adventEnabled)
					echo '<img src="images/pages/header_winter.png" srcset="images/pages/header_winter-640w.png 640w, images/pages/header_winter.png 960w" alt="Mario Kart PC" />';
				else
					echo '<img src="images/pages/header.png" srcset="images/pages/header-640w.png 640w, images/pages/header.png 960w" alt="Mario Kart PC" />';
				?>
			</td>
			<td id="header_right">
				<img src="<?php echo $adventEnabled ? 'images/header_rwinter.png' : 'images/pages/header-right.png'; ?>" alt="|\" />
			</td>
		</tr>
	</table>
</header>
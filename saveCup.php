<?php
if (isset($_POST['nom']) && isset($_POST['auteur']) && isset($_POST['mode'])) {
	include('getId.php');
	include('initdb.php');
	include('ip_banned.php');
	$mode = $_POST['mode'];
	if (isBanned()) {
		mysql_close();
		exit;
	}
	$save = true;
	$andWhere = '';
	switch ($mode) {
	case 0:
		$table = 'mkcircuits';
		$andWhere = ' AND !type';
		break;
	case 1:
		$table = 'circuits';
		break;
	case 2:
		$table = 'mkcircuits';
		$andWhere = ' AND type';
		break;
	case 3:
		$table = 'arenes';
		break;
	default:
		mysql_close();
		exit;
	}
	for ($i=0;$i<4;$i++) {
		if (!isset($_POST['cid'.$i])) {
			$save = false;
			break;
		}
		if (!mysql_numrows(mysql_query('SELECT * FROM `'. $table .'` WHERE id='. $_POST['cid'. $i] .' AND identifiant="'. $identifiants[0] .'" AND identifiant2="'. $identifiants[1] .'" AND identifiant3="'. $identifiants[2] .'" AND identifiant4="'. $identifiants[3] .'"'. $andWhere))) {
			$save = false;
			break;
		}
	}
	$cupId = -1;
	if ($save) {
		setcookie('mkauteur', $_POST['auteur'], 4294967295,'/');
		if (isset($_POST['id'])) {
			if (mysql_numrows(mysql_query('SELECT * FROM mkcups WHERE id="'. $_POST['id'] .'" AND identifiant="'. $identifiants[0] .'" AND identifiant2="'. $identifiants[1] .'" AND identifiant3="'. $identifiants[2] .'" AND identifiant4="'. $identifiants[3] .'"'))) {
				mysql_query('UPDATE `mkcups` SET circuit0="'. $_POST['cid0'] .'",circuit1="'. $_POST['cid1'] .'",circuit2="'. $_POST['cid2'] .'",circuit3="'. $_POST['cid3'] .'",nom="'. $_POST['nom'] .'",auteur="'. $_POST['auteur'] .'" WHERE id="'. $_POST['id'] .'"');
				$cupId = $_POST['id'];
			}
		}
		else {
			mysql_query('INSERT INTO `mkcups` VALUES(NULL,CURRENT_TIMESTAMP(),'.$identifiants[0].','.$identifiants[1].','.$identifiants[2].','.$identifiants[3].',0,0,0,0,"'. $mode .'","'. $_POST['cid0'] .'","'. $_POST['cid1'] .'","'. $_POST['cid2'] .'","'. $_POST['cid3'] .'","'. $_POST['nom'] .'","'. $_POST['auteur'] .'")');
			$cupId = mysql_insert_id();
			include('session.php');
			if ($id) {
				$getFollowers = mysql_query('SELECT follower FROM `mkfollowusers` WHERE followed="'. $id .'"');
				while ($follower = mysql_fetch_array($getFollowers))
					mysql_query('INSERT INTO `mknotifs` SET type="follower_circuit", user="'. $follower['follower'] .'", link="3,'.$cupId.'"');
			}
		}
		if ($cupId != -1) {
			if (isset($_POST['cl'])) {
				include('challenge-associate.php');
				challengeAssociate('mkcups',$cupId,$_POST['cl']);
			}
		}
	}
	echo $cupId;
	mysql_close();
}
?>
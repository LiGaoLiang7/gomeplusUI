<?php
	$option = $_REQUEST['option'];
if ($option == 'crop')
{
	$jpeg_quality = 100;
	$src_path = './upload/'.$_POST['img'];
	$imgType = strrchr($src_path, ".");

	$dis_path_large = './upload/'.md5(time().mt_rand(10, 99))."_large".$imgType;
	$dis_path_medium = './upload/'.md5(time().mt_rand(10, 99))."_medium".$imgType;
	$dis_path_small = './upload/'.md5(time().mt_rand(10, 99))."_small".$imgType;
	//创建源图的实例
	$src = imagecreatefromstring(file_get_contents($src_path));
	// var_dump($src);
	//裁剪开区域左上角的点的坐标
	$x = $_POST['x'];
	$y = $_POST['y'];
	//裁剪区域的宽和高
	$width = $_POST['w'];
	$height = $_POST['h'];

	//最终保存成图片的宽和高，和源要等比例，否则会变形
	$final_width_large = 150;
	$final_height_large = 150;
	$final_width_medium = 100;
	$final_height_medium = 100;
	$final_width_small = 50;
	$final_height_small = 50;

	//将裁剪区域复制到新图片上，并根据源和目标的宽高进行缩放或者拉升
	$new_image_large = imagecreatetruecolor($final_width_large, $final_height_large);
	$new_image_medium = imagecreatetruecolor($final_width_medium, $final_height_medium);
	$new_image_small = imagecreatetruecolor($final_width_small, $final_height_small);

	imagecopyresampled($new_image_large, $src, 0, 0, $x, $y, $final_width_large, $final_height_large, $width, $height);
	imagecopyresampled($new_image_medium, $src, 0, 0, $x, $y, $final_width_medium, $final_height_medium, $width, $height);
	imagecopyresampled($new_image_small, $src, 0, 0, $x, $y, $final_width_small, $final_height_small, $width, $height);
	//输出图片
	header('Content-Type: image/jpeg');
	$result1 =  imagejpeg($new_image_large,$dis_path_large,$jpeg_quality);
	$result2 =  imagejpeg($new_image_medium,$dis_path_medium,$jpeg_quality);
	$result3 =  imagejpeg($new_image_small,$dis_path_small,$jpeg_quality);

	if($result1 && $result2 && $result3){
		echo "successfully";
	}else{
		echo "failed";
	}
	imagedestroy($src);
	imagedestroy($new_image_large);
	imagedestroy($new_image_medium);
	imagedestroy($new_image_small);
	exit;
}
?>
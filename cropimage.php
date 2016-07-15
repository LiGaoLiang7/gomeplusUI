<?php
	$option = $_REQUEST['option'];
if ($option == 'crop')
{
	// $targ_w = $targ_h = 150;
	// $src = './upload/'.$_POST['img'];

	// $img_r = imagecreatefromjpeg($src);
	// $dst_r = ImageCreateTrueColor( $targ_w, $targ_h );
	// imagecopyresampled($dst_r,$img_r,0,0,$_POST['x'],$_POST['y'],
	// $targ_w,$targ_h,$_POST['w'],$_POST['h']);

	// header('Content-type: image/jpeg');
	// imagejpeg($dst_r,null,$jpeg_quality);
	// exit;
	$jpeg_quality = 90;
	$src_path = './upload/'.$_POST['img'];
	var_dump($src_path);
	//创建源图的实例
	$src = imagecreatefromstring(file_get_contents($src_path));
	 var_dump($src);die;
	//裁剪开区域左上角的点的坐标
	$x = $_POST['x'];
	$y = $_POST['y'];
	//裁剪区域的宽和高
	$width = $_POST['w'];
	$height = $_POST['h'];


	//最终保存成图片的宽和高，和源要等比例，否则会变形
	$final_width = 150;
	$final_height = round($final_width * $height / $width);
	 var_dump($x);
	 var_dump($y);
	 var_dump($width);
	 var_dump($height);
	 var_dump($final_width);
	 var_dump($final_height);
	//将裁剪区域复制到新图片上，并根据源和目标的宽高进行缩放或者拉升
	$new_image = imagecreatetruecolor($final_width, $final_height);

	var_dump($new_image);
	imagecopyresampled($new_image, $src, 0, 0, $x, $y, $final_width, $final_height, $width, $height);
	 
	//输出图片
	header('Content-Type: image/jpeg');
	$newImage = imagejpeg($new_image,'./upload/',$jpeg_quality);
	echo $newImage;
	// imagedestroy($src);
	// imagedestroy($new_image);
	exit;
}
?>
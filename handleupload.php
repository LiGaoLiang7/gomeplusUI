<?php
// $action = $_POST['act']; 
// if($action=='delimg'){ //删除图片 
//     $filename = $_POST['imagename']; 
//     if(!empty($filename)){ 
//         unlink('files/'.$filename); 
//         echo '1'; 
//     }else{ 
//         echo '删除失败.'; 
//     } 
// }else{ //上传图片
    $picname = $_FILES['upload']['name']; 
    $picsize = $_FILES['upload']['size']; 
    if ($picname != "") { 
        if ($picsize > 2048000) { //限制上传大小 
            echo '图片大小不能超过2M'; 
            exit; 
        } 
        $type = strstr($picname, '.'); //限制上传格式 
        if ($type != ".gif" && $type != ".jpg" && $type != ".png" && $type != ".jpeg" ) { 
            echo '图片格式不对！'; 
            exit; 
        } 
        $rand = rand(100, 999); 
        $pics = md5(time().mt_rand(10, 99)) . $rand . $type; //命名图片名称 
        $pic_path = "upload/". $pics; 
        move_uploaded_file($_FILES['upload']['tmp_name'], $pic_path); 
    } 
    $size = round($picsize/1024,2);
    $arr = array( 
        'name'=>$picname, 
        'pic'=>$pics, 
        'size'=>$size 
    ); 
    echo json_encode($arr);
// } 
?> 
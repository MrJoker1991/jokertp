<?php
// 应用公共文件

///**
// * 自定逻辑异常抛出
// * @param string $msg 异常消息
// * @param integer $code 异常代码 默认为0
// * @param array $data  传递数据
// * @throws \app\common\exception\HttpException
// */
//function s_exception($msg, $code = -1, $data=[])
//{
//    throw new \app\common\exception\HttpException($msg,$code,$data);
//}

/**
 * 异常抛出
 * @param string $msg
 * @param int $code
 * @throws Exception
 */
function s_exception($msg, $code = 0)
{
    throw new \Exception($msg, $code);
}

/**
 * 参数校验，不符合，异常抛出
 * @param $name
 * @param string $rule
 * @param int $code
 * @throws Exception
 */
function s_validate($name, $rule = '', $code = 0)
{
    // 使用参数方式，二维数组，就不需要再传$rule,具体见官方文档
    // [
    //    ['mobile','require|isMobile','手机号码不能为空|手机号码格式不正确']
    // ]
    $res = (new \app\common\validate\CheckValidate())->getRule($name, $rule);
    if ($res !== true) {
        throw new \Exception($res, $code);
    }
}

/**
 * 引入扩展目录的扩展包
 * @param $name
 * @param string $rule
 * @param int $code
 * @throws Exception
 */
function includeExtend($class, $ext = EXT)
{
    return \think\Loader::import($class, EXTEND_PATH, $ext);
}

/**
 * php取当天的0点和23点59分59秒的时间戳方法
 * @return array
 */
function getTodayTime()
{
    $year = date("Y");
    $month = date("m");
    $day = date("d");
    $start = mktime(0, 0, 0, $month, $day, $year);//当天开始时间戳
    $end = mktime(23, 59, 59, $month, $day, $year);//当天结束时间戳
    return [$start, $end];
}

/**
 * 二维码png生成
 * @param type $text 生成二维码的文本内容
 * @param type $size 生成图片大小 默认4  30:638 20:460 15:375  10:250 6:150 4:100
 * @param type $margin 二维码周围边框空白区域间距值 默认1
 * @param type $level 容错率 L(QR_ECLEVEL_L，7%)，M(QR_ECLEVEL_M，15%)，Q(QR_ECLEVEL_Q，25%)，H(QR_ECLEVEL_H，30%)
 * @param type $outfile 是否输出二维码图片文件，默认否
 * @param type $saveandprint 是否保存二维码并显示
 */
function qrcodePng($text, $size = 4, $margin = 1, $level = "L", $outfile = false, $saveandprint = false)
{
    vendor("phpqrcode.qrlib");
    \QRcode::png($text, $outfile, $level, $size, $margin, $saveandprint);
}

/**
 * 根据要求尺寸获取phpqrcode 的size大小
 * @param int $width
 * @return int
 */
function getQrcodeSizeByWidth($width = 100, $level = "M")
{
//        if($width>1000){
//            $level = "H";
//        }else if($width > 600){
//            $level = "Q";
//        }
    $map = [
        "M" => [
            //递进2.86左右
            100 => 2.88,
            200 => 5.73,
            300 => 8.59,
            400 => 11.45,
            500 => 14.3,
            600 => 17.15,
            700 => 20,
            800 => 22.86,
            900 => 25.72,
            1000 => 28.58,
        ],
        "Q" => [
        ]
    ];
    if (!array_key_exists($width, $map[$level])) {
        $width = 100;
    }
    return $map[$level][$width];
}

/**
 * 二维数组去重
 * @param $array
 * @param string $pk
 * @return array
 */
function remove_duplicate($array, $pk = 'id')
{
    $result = array();
    foreach ($array as $key => $value) {
        $has = false;
        foreach ($result as $val) {
            if ($val[$pk] == $value[$pk]) {
                $has = true;
                break;
            }
        }
        if (!$has) {
            $result[] = $value;
        }
    }
    return $result;
}

/**
 * 二维数组排序
 * @param $arr
 * @param $sortKey
 * @param int $sortOrder
 * @param int $sortFlags
 * @return mixed
 */
function array_sort($arr, $sortKey, $sortOrder = SORT_ASC, $sortFlags = SORT_NUMERIC)
{
    foreach ($arr as $key => $data) {
        $keyArr[$key] = $data[$sortKey];
    }
    array_multisort($keyArr, $sortOrder, $sortFlags, $arr);
    return $arr;
}

/**
 * 生成指定长度随机值
 *
 * @param int $length 长度
 * @param int $type 类型 0：不包含特殊符号 -1：涵盖所有符号 1：只要数字 2：小写字母 3：大写字母 4：特殊符号
 * @return string
 */
function random_string($length = 6, $type = 0)
{
    $arr = array(1 => "0123456789", 2 => "abcdefghijklmnopqrstuvwxyz", 3 => "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 4 => "~@#$%^&*(){}[]|");
    if ($type == 0) {
        //不需要特殊符号
        array_pop($arr);
        $string = implode("", $arr);
    } elseif ($type == "-1") {
        //所有符号
        $string = implode("", $arr);
    } else {
        //指定符号 1 2 3 4
        $string = $arr[$type];
    }
    $count = strlen($string) - 1;
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= $string[rand(0, $count)];
    }
    return $code;
}

/**
 * 七牛图片瘦身
 * @param $url
 * @return string
 */
function qiniu_image_imageslim($url)
{
    $strArray = explode("?", $url);
    if (count($strArray) > 1) {
        return $strArray[0] . "?imageslim&" . $strArray[1];
    } else {
        return $url . "?imageslim";
    }
}

/**
 * 七牛图片大小压缩
 * @param $url
 * @param int $compress
 * @return string
 */
function qiniu_image_process($url, $compress = 720)
{
    if (strpos($url, 'imageView2/') !== false) {
        return $url;
    } else {
        $strArray = explode("?", $url);
        if (count($strArray) > 1) {
            return $strArray[0] . "?imageView2/2/w/" . $compress . "&" . $strArray[1];
        } else {
            return $url . "?imageView2/2/w/" . $compress;
        }
    }
}

/**
 * 校验微信版本是否是6.7.2
 * @return bool
 */
function is_wechat_version672()
{
    if (strpos($_SERVER['HTTP_USER_AGENT'], '6.7.2') !== false) {
        return true;
    }
    return false;
}

/**
 * 是否是安卓环境
 * @return bool
 */
function is_android(){
    if ( strpos($_SERVER['HTTP_USER_AGENT'], 'Android') !== false ) {
        return true;
    }
    return false;
}

/**
 * 七牛图片大小压缩
 * @param $url
 * @param int $compress
 * @return string
 */
function qiniu_image_webp($url, $compress = 640)
{
    if (is_android()) {
        if (strpos($url, 'imageView2/') !== false) {
            return $url;
        } else {
            $strArray = explode("?", $url);
            if (count($strArray) > 1) {
                return $strArray[0] . "?imageView2/0/w/" . $compress . "/format/webp&" . $strArray[1];
            } else {
                return $url . "?imageView2/0/w/" . $compress . "/format/webp";
            }
        }
    } else {
        if (strpos($url, 'imageView2/') !== false) {
            return $url;
        } else {
            $strArray = explode("?", $url);
            if (count($strArray) > 1) {
                return $strArray[0] . "?imageView2/0/w/" . $compress . "/format/jpg&" . $strArray[1];
            } else {
                return $url . "?imageView2/0/w/" . $compress . "/format/jpg";
            }
        }
    }
}

/**
 * debug调试日志函数
 * @param  mixed $data
 * @param boolean $force 强制写入
 * @param string $fileName 文件路径
 */
function debug_log($data, $force = false, $fileName = "")
{
    $debug = false;
    $status = config('app_status');
    if (in_array($status, array("debug", "develop", "test","office"))) {
        $debug = true;
    }

    if ($fileName == '') {
        $fileName = "/tmp/yyzs_test.log";
    }

    if ($debug || $force) {
        if(DIRECTORY_SEPARATOR == '\\'){
            return true;
        }        
        file_put_contents($fileName, "##" . date('Y-m-d H:i:s') . "\n" . print_r($data, true) . "\n", FILE_APPEND);
    }
}


if (!function_exists('getallheaders')) {

    function getallheaders()
    {
        $headers = '';
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }

}
/**
 * 获取终端真实ip
 * @return string
 */
function get_client_real_ip()
{
    $clientArr = getallheaders();
    $clientIp = (isset($clientArr['X-Forwarded-For']) && !empty($clientArr['X-Forwarded-For']))?$clientArr['X-Forwarded-For']:"";   //负载均衡服务器,获取真实客户端IP
    if (!$clientIp) {
        $clientIp = request()->ip();
    } else {
        $clientIps = explode(",", $clientIp);
        $clientIp = $clientIps[0];
    }
    return $clientIp;
}

/**
 * 获取h5短链
 * @param $url
 * @return bool
 */
function get_h5_short_url($url){
//    $apiUrl = "http://apihdj.ygj.com.cn/Open/getH5ShortUrl/";
    $apiUrl = "http://api.huodongju.com/Open/getH5ShortUrl/";
    $nonceStr = get_nonce_str();
    $apiUrl = $apiUrl . '?nonce_str=' . $nonceStr . '&signature=' . get_server_connect_signature($nonceStr) . '&url=' . $url;

    $cl = curl_init();
    curl_setopt($cl, CURLOPT_URL, $apiUrl);
    curl_setopt($cl, CURLOPT_RETURNTRANSFER, 1 );
    $content = curl_exec($cl);
    $status = curl_getinfo($cl);
    curl_close($cl);
    if (isset($status['http_code']) && $status['http_code'] == 200) {
        $content = json_decode($content, true);
        return $content['data'];
    } else {
        return false;
    }
}
/**
 * 获取活动的h5链接
 * @param type $type 活动类型 vote lottery yuyue
 * @param type $id 活动id，最好是加密的
 * @return string
 */
function get_activity_h5_url($type,$id){
    if ($type && $id) {
        //除了未统一的抽奖使用aid参数外，请都使用id参数
        if ($type == 'lottery') {
            return config('DOMAIN_URL') . 'h5/hdj/jump?_c=' . $type . '&_a=index&aid=' . $id;
        }
        return config('DOMAIN_URL') . 'h5/hdj/jump?_c=' . $type . '&_a=index&id=' . $id;
    }
    return '';    
}

/**
 * 获取活动聚服务器通信的key
 * @param $nonceStr
 * @return string
 */
function get_server_connect_signature($nonceStr){
    $nonceStr = $nonceStr . 'starry_chinese';
    return md5($nonceStr);
}

/**
 * 获取随机字符串
 * @param int $length
 * @return string
 */
function get_nonce_str($length = 16)
{
    $str = "";
    $str_pol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    $max = strlen($str_pol) - 1;
    for ($i = 0; $i < $length; $i++) {
        $str .= $str_pol[mt_rand(0, $max)];
    }
    return $str;
}

/**
 * 版本号判断
 * 仅支持数字和.的版本号比较
 * @param type $version1  1.1.02.3
 * @param type $version2  1.1.3.15
 * @return int 0:eq, 1:gt, -1:lt
 */
function compare_version($version1,$version2){
    $verList1 = explode('.', $version1);
    $verList2 = explode('.', $version2);

    if(empty($verList1) && empty($version2)){
        return 0;
    }elseif(empty ($version1)){
        return -1;
    }elseif(empty ($version2)){
        return 1;
    } else {
        $count1 = count($verList1);
        $count2 = count($verList2);
        $count = max($count1,$count2);
        for($i=0;$i<$count;$i++){
            if(!isset($verList1[$i])){
                return -1;
            }elseif (!isset($verList2[$i])) {
                return 1;
            }else{
                $sub1 = intval($verList1[$i]);
                $sub2 = intval($verList2[$i]);

                if($sub1 > $sub2){
                    return 1;
                }elseif($sub1 < $sub2){
                    return -1;
                }
            }
        }
        return 0;
    }    
}

/**
 * 判断是否是json格式
 * @param $data
 * @return bool
 */
function is_json($data){
    $data = json_decode($data, true);
    if(json_last_error() === JSON_ERROR_NONE){
        return true;
    }
    return false;
}


/**
 * crypto 后端解密
 * 前端js加密
 * https://blog.catscarlet.com/201701162689.html
 * @param type $content
 * @param string $key
 * @param type $iv
 * @return boolean
 */
function crypto_decrypt($content,$key,$iv){
//    $content = 'F0QOnmU79TFx6IhFLsUnfSvwJvmKP5uzU2h5jJH+MPY=';
//    $key = 'encryptionkey';
//    $iv = 'fXyFiQCfgiKcyuVNCGoILQ==';
    if(empty($key) || empty($iv)){
        return false;
    }

    while (strlen($key) < 16) {
        $key = $key."\0";
    }

    if (strlen($iv) != strlen(base64_encode(mcrypt_create_iv(mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC), MCRYPT_RAND)))) {
        return false;
    }

    $iv_base64_decode = base64_decode($iv);

    return mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, base64_decode($content), MCRYPT_MODE_CBC, $iv_base64_decode);                
}
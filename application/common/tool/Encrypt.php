<?php

namespace app\common\tool;

/**
 * RSA DES 加解密
 * Encrypt Tool
 */
class Encrypt {

    /**
     * rsa public key
     * @var string 
     */
    private static $_rsaPublicKey = '';

    /**
     * rsa private key
     * @var string 
     */
    private static $_rsaPrivateKey = '';

    /**
     * 自定义进制字符串 共10+26+26=62个字符
     * @var string 
     */
    private static $_numberSystemDict = 'a0bc1de2fg3hij4klm5nop6qr7stu8vwxy9zABCDEFGHIJKLMNOPQRSTUVWXYZ';

    /**
     * set rsa public key
     * @param string $file
     */
    public static function setRsaPublicKey($file) {
        if (file_exists($file)) {
            //@todo cache
            self::$_rsaPublicKey = file_get_contents($file);
        } else {
//            log_message('debug', '#FAILED# To Load RSA Public Key : ' . $file);
        }
    }

    /**
     * get rsa public key
     * @return string
     */
    public static function getRsaPublicKey() {
        return self::$_rsaPublicKey;
    }

    /**
     * set rsa private key
     * @param string $file
     */
    public static function setRsaPrivateKey($file) {
        if (file_exists($file)) {
            //@todo cache
            self::$_rsaPrivateKey = file_get_contents($file);
        } else {
//            log_message('debug', '#FAILED# To Load RSA Private Key : ' . $file);
        }
    }

    /**
     * get rsa private key
     * @return string
     */
    public static function getRsaPrivateKey() {
        return self::$_rsaPrivateKey;
    }

    /**
     * RSA公钥加密及base64编码
     * @param string $data
     * @return string
     */
    public static function rsaEncodeWithPublicKey($data) {
        $encodeData = '';
        openssl_public_encrypt($data, $encodeData, self::$_rsaPublicKey);
        return base64_encode($encodeData);
    }

    /**
     * base64解码及RSA私钥解密
     * @param string $data
     * @return string
     */
    public static function rsaDecodeWithPrivateKey($data) {
        $decodeData = '';
        $data = base64_decode($data);
        openssl_private_decrypt($data, $decodeData, self::$_rsaPrivateKey);
        return $decodeData;
    }

    /**
     * DES加密及base64编码
     * 建议desKey长度限制在8位以下?
     * @param string $data
     * @param string $desKey
     * @return string
     */
    public static function desEncode($data, $desKey) {
        $encodeData = mcrypt_encrypt(MCRYPT_DES, $desKey, $data, MCRYPT_MODE_CBC);
        return base64_encode($encodeData);
    }

    /**
     * base64解码及DES解密
     * @param string $data
     * @param string $desKey
     * @return string
     */
    public static function desDecode($data, $desKey) {
        $data = base64_decode($data);
        $decodeData = mcrypt_decrypt(MCRYPT_DES, $desKey, $data, MCRYPT_MODE_CBC);
        return $decodeData;
    }

    /**
     * 简单通过ascii base64 urlencode加密
     * @param string $txt 要加密的字符串
     * @param int $salt ascii跨度
     * @return string
     */
    public static function AsciiEncode($txt, $salt = 12) {
        for ($i = 0; $i < strlen($txt); $i++) {
            $txt[$i] = chr(ord($txt[$i]) + $salt);
        }
        return urlencode(base64_encode(urlencode($txt)));
    }

    /**
     * AsciiEncode 解密方式
     * @param string $txt 要解密的字符串
     * @param int $salt ascii解密跨度
     * @return string
     */
    public static function AsciiDecode($txt, $salt = 12) {
        $txt = urldecode(base64_decode(urldecode($txt)));
        for ($i = 0; $i < strlen($txt); $i++) {
            $txt[$i] = chr(ord($txt[$i]) - $salt);
        }
        return $txt;
    }

    /**
     * 十进制数转换成其它进制
     * 可以转换成2-62任何进制
     *
     * @param integer $num 转换数字
     * @param integer $to 进制
     * @return string
     */
    public static function decTo($num, $to = 62) {
        if ($to == 10 || $to > 62 || $to < 2) {
            return $num;
        }
        $dict = self::$_numberSystemDict;
        $ret = '';
        do {
            $ret = $dict[bcmod($num, $to)] . $ret;
            $num = bcdiv($num, $to);
        } while ($num > 0);
        return $ret;
    }

    /**
     * 从其它进制数转换成十进制数
     * 适用2-62的任何进制
     *
     * @param string $num 转换字符串
     * @param integer $from 进制
     * @return number
     */
    public static function decFrom($num, $from = 62) {
        if ($from == 10 || $from > 62 || $from < 2) {
            return $num;
        }
        $num = strval($num);
        $dict = self::$_numberSystemDict;
        $len = strlen($num);
        $dec = 0;
        for ($i = 0; $i < $len; $i++) {
            $pos = strpos($dict, $num[$i]);
            if ($pos >= $from) {
                continue; // 如果出现非法字符，会忽略掉。比如16进制中出现w、x、y、z等
            }
            $dec = bcadd(bcmul(bcpow($from, $len - $i - 1), $pos), $dec);
        }
        return $dec;
    }

}
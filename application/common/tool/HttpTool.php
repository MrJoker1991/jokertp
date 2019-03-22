<?php

namespace app\common\tool;


class HttpTool
{
    /**
     * request url
     * @var string
     */
    private static $_url = '';

    /**
     * connect time out
     * @var int
     */
    private static $_connectTimeOut = 10;

    /**
     * request time out second
     * @var int
     */
    private static $_timeOut = 10;

    /**
     * user agent
     * @var string
     */
    private static $_userAgent = 'tsing-x v1.0';


    /**
     * set CURLOPT_CONNECTTIMEOUT  - s
     * @param int $time
     */
    public static function setConnectTimeOut($time = 30) {
        self::$_connectTimeOut = $time;
    }


    /**
     * set CURLOPT_TIMEOUT - s
     * @param int $time
     */
    public static function setTimeOut($time = 30) {
        self::$_timeOut = $time;
    }


    /**
     *  request url
     * @return string
     */
    public static function getUrl() {
        return self::$_url;
    }

    /**
     * make post request (the same with self::post , return with array include errno\error\result)
     * @param string $url 请求url
     * @param array|string $data 提交请求参数 如果是上传文件 'file1'='@/data/xxx.txt' 注意@后跟物理路径
     * @param inT $connectTimeOut
     * @return array if errno is 0 means success and error is ''
     */
    public static function post2($url, $data, $connectTimeOut = 30) {
        if (!$connectTimeOut) {
            $connectTimeOut = self::$_connectTimeOut;
        }
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_USERAGENT, self::$_userAgent);
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, $connectTimeOut);
        curl_setopt($curl, CURLOPT_TIMEOUT, self::$_timeOut);
//                curl_setopt($curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
        $result = curl_exec($curl);
        $error = curl_error($curl);
        $errno = curl_errno($curl);
        curl_close($curl);
        return array('errno' => $errno, 'error' => $error, 'result' => $result);
    }

    /**
     * Make an POST request.
     * @param string $url      url like "http://example.com".
     * @param array  $data     An array to make query string like "example1=&example2=" .
     * @return mixed
     */
    public static function post($url, $data = array()) {
        self::$_url = $url;
        $query = self::buildHttpQuery($data, 'POST');

        $response = self::makeRequest(self::$_url, 'POST', $query);
        return $response;
    }

    /**
     * raw post data
     * @param string $url
     * @param string $data
     * @return mixed
     */
    public static function input($url, $data) {
        return self::postViaBody($url, $data);
    }

    /**
     * make an post request with body string
     * @param string $url
     * @param string $body
     * @return mixed
     */
    public static function postViaBody($url, $body) {
        self::$_url = $url;

        $response = self::makeRequest(self::$_url, 'POST', $body);
        return $response;
    }

    /**
     * Make an GET request.
     * @param string $url     url like "http://example.com".
     * @param array  $data    An array to make query string like "example1=&example2=" .
     * @return mixed
     */
    public static function get($url, $data = array()) {
        self::$_url = $url;
        if (!empty($data)) {
            self::$_url .= "?" . self::buildHttpQuery($data);
        }
        $response = self::makeRequest(self::$_url, 'GET');
        return $response;
    }

    /**
     * Make an HTTP request.
     * @param string $url        url like "http://example.com/xxxx?example1=&example2=".
     * @param string $method     Request method is "GET" or "POST".
     * @param string $postfields A query string post to $url.
     * @return mixed
     */
    public static function makeRequest($url, $method, $postfields = NULL) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:'));
        if ('POST' === $method) {
            curl_setopt($ch, CURLOPT_POST, 1);
            if (!empty($postfields)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields);
            }
        }
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, self::$_connectTimeOut);
        curl_setopt($ch, CURLOPT_TIMEOUT, self::$_timeOut);
        curl_setopt($ch, CURLOPT_USERAGENT, self::$_userAgent);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        $output = curl_exec($ch);
        curl_close($ch);
        return $output;
    }

    /**
     * Build HTTP Query.
     * @param array $params Name => value array of parameters.
     * @return string HTTP query.
     */
    public static function buildHttpQuery(array $params, $method = 'GET') {
        if (empty($params)) {
            return '';
        }

        if ('GET' == $method) {
            $keys = self::urlencode(array_keys($params));
            $values = self::urlencode(array_values($params));
        } else {
            $keys = array_keys($params);
            $values = array_values($params);
        }

        $params = array_combine($keys, $values);

        uksort($params, 'strcmp');

        $pairs = array();
        foreach ($params as $key => $value) {
            $pairs[] = $key . '=' . $value;
        }

        return implode('&', $pairs);
    }

    /**
     * URL Encode.
     * @param mixed $item string or array of items to url encode.
     * @return mixed url encoded string or array of strings.
     */
    public static function urlencode($item) {
        static $search = array('%7E');
        static $replace = array('~');

        if (is_array($item)) {
            return array_map(array(__CLASS__, "urlencode"), $item);
        }

        if (is_scalar($item) === false) {
            return $item;
        }

        return str_replace($search, $replace, rawurlencode($item));
    }

    /**
     * URL Decode.
     * @param mixed $item Item to url decode.
     * @return string URL decoded string.
     */
    public static function urldecode($item) {
        if (is_array($item)) {
            return array_map(array("HttpTool", 'urldecode'), $item);
        }

        return urldecode($item);
    }
}
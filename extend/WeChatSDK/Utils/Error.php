<?php
/**
 * Error 错误代码类
 */

namespace WeChatSDK\Utils;

class Error {

    const CODE_ACCESS_TOKEN_ERROR = 40001; //获取 access_token 时 AppSecret 错误，或者 access_token 无效。请开发者认真比对 AppSecret 的正确性，或查看是否正在为恰当的公众号调用接口

    /**
     * 获取某个错误的对象数组
     *
     * @return object(err, NULL)
     *
     * Examples:
     * ```
     * Error::code('ERR_GET');
     * ```               
     */
    static public function code ($code)
    {

        // 本SDK自定义错误类型
        $code_arr = array(
            // 错误: get方式请求api网络错误
            'ERR_GET' => array(13001, 'http get api error.'),
            // 错误: post方式请求api网络错误     
            'ERR_POST' => array(13002, 'http post api error.'),
            // 错误: 消息类型未定义
            'ERR_MEG_TYPE' => array(13003, 'message type is not defined.')
        );
        
        return array((object)array(
                'errcode' => $code_arr[$code][0],
                'errmsg' => $code_arr[$code][1]
            ), NULL);
    }
}
<?php

namespace app\common\exception;


use think\Exception;

/**
 * Class BaseException
 * 自定义异常类的基类
 */
class BaseException extends Exception
{
    // 错误具体信息
    public $msg = '无效参数';
    // 自定义的错误码
    public $code = -1;
    // 自定义data
    public $data = '';


    /**
     * 构造函数，接收一个关联数组
     * @param array $params 关联数组只应包含code、msg和errorCode，且不应该是空值
     */
    public function __construct($params=[])
    {
        if(!is_array($params)){
            return;
        }
        if(array_key_exists('code',$params)){
            $this->code = $params['code'];
        }
        if(array_key_exists('msg',$params)){
            $this->msg = $params['msg'];
        }
        if(array_key_exists('data',$params)){
            $this->data = $params['data'];
        }
    }


}
<?php

namespace app\common\exception;

use app\common\tool\HttpStatus;

class HttpException extends BaseException
{
    /**
     * 继承BaseException异常类
     * HttpException constructor.
     * @param $message
     * @param int $code
     * @param array $data
     */
    public function __construct($message,$code = 0,$data=[])
    {
        $params = [
            'msg' => $message,
            'code' => $code,
            'data' => $data
        ];
        parent::__construct($params);

    }
}
<?php

namespace app\common\exception;

use think\exception\Handle;
use think\Log;
use think\Request;
use Exception;//注意这边命名空间不要出错
use app\common\tool\HttpStatus;

class ExceptionHandler extends Handle
{
    private $code;
    private $msg;
    private $data;

    /**
     * 错误代码，都通过该方法返回
     * 需要返回客户端当前请求的URL路径
     * @param Exception $e
     * @return \think\Response|\think\response\Json
     */
    public function render(Exception $e)
    {
        if ($e instanceof BaseException)
        {
            //如果是自定义异常，则控制http状态码，不需要记录日志
            //因为这些通常是因为客户端传递参数错误或者是用户请求造成的异常
            //不应当记录日志
            $this->code = $e->code;
            $this->msg = $e->msg;
            $this->data = $e->data;
        }
        else{
            // 如果是服务器未处理的异常，将http状态码设置为500，并记录日志
            if(config('app_debug')){
                // 调试状态下需要显示TP默认的异常页面，因为TP的默认页面
                // 很容易看出问题
                return parent::render($e);
            }

            $this->code = 0;
            $this->msg = '内部错误,工程师正在维修...';
            $this->recordErrorLog($e);
        }
        //获取实例请求
        $request = Request::instance();
        $result = [
            'code' => $this->code,
            'msg'  => $this->msg,
            'request_url' => $request = $request->url()
        ];
        if (!empty($this->data)) {
            $result['data'] = $this->data;
        }
        return json($result);
    }


    /**
     * 将异常写入日志
     * @param Exception $e
     */
    private function recordErrorLog(Exception $e)
    {
        Log::init([
            'type'  =>  'File',
            'path'  =>  LOG_PATH,   // TODO::这个路径根据实际进行自定义，默认是框架runtime日志路径
            'level' => ['error']
        ]);
        Log::record($e->getMessage(),'error');
    }

}
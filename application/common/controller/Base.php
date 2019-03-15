<?php

namespace app\common\controller;

class Base extends \think\Controller
{
    public function __construct(\think\Request $request = null) {
        parent::__construct($request);
    }


    /**
     * 将输入中的敏感字符替换为安全字符
     * @param string $content 字符串
     * @param bool $toDel 是否直接删除
     * @return null|string|string[]
     */
    protected function dealSensitiveInputChar($content, $toDel = true) {
        $patterns = ['/<script>/i', '/<[^<]?\/script>/i'];
        if ($toDel) {
            $replacements = ["", ""];
        } else {
            $replacements = ['&lt;script&gt;', '&lt;/script&gt;'];
        }
        return preg_replace($patterns, $replacements, $content);
    }

    /**
     * 支持获取带有颜文字 火星文  非表情
     * @param $string
     * @return string
     */
    public function getUnicodeString($string){
        return trim(json_encode($string,JSON_UNESCAPED_UNICODE),'"');
    }


    /**
     * 用户模块请求频率记录与限制
     * 默认5秒内连续5次请求后，需要等待5秒，则将返回false
     * @param string $userId 用户id
     * @param int $ttl 一定时间内 默认5s
     * @param int $waitSecond 等待秒数才可下次操作 默认5s
     * @param int $times 合法请求次数 默认5次
     * @return boolean
     */
    // public function requestFrequencyLimit($userId, $ttl = 5, $waitSecond = 5, $times = 5) {
    //     $key = \app\common\tool\RedisKey::YYZS_STRING_USER_REQUEST_MARK_ . $userId . "_" . request()->controller() . "_" . request()->action();
    //     if(\think\Cache::has($key)){
    //         $value = \think\Cache::get($key);
    //         if ($value >= $times) {
    //             \think\Cache::set($key, $value, $waitSecond);
    //             return false;
    //         }
    //         \think\Cache::inc($key);
    //     }else{
    //         \think\Cache::set($key, 1, $ttl);
    //     }
    //     return true;
    // }

}
<?php

namespace app\api\controller;
use app\common\service\BaseService;

class Test extends ApiWrap
{
    public function __construct(\think\Request $request = null)
    {   
        parent::__construct($request);
    }

    public function index(){
        echo " Jokersss ";
    }

    public function setTest(){
        $baseService = new BaseService();
        $redisKey = \app\common\tool\RedisKey::JIE_STRING_TEST.time();
        $val = '现在是：'.date('Y-m-d H:i:s', time());
        $res = $baseService->setRedisValue($redisKey, $val);
        dump($res);
    }

    public function getTest(){
        $redisKey = 'jie_string_test_1552550003';
        $redis = \app\common\tool\RedisTool::getInstance();
        $res = $redis->get($redisKey);
        dump($res);
    }

    public function sendEmail(){
        $receive = '136272038@qq.com';
        $data = [
            "recipients" => [$receive],
            "subject" => "Joker Test",
            "body" => "来自Joker 的测试",
            // "attachments" => [["file" => $csvFile, "name" => "预约名单.csv"]]
        ];

        $sendRes = \app\common\tool\Mail::send($data);
        dump($sendRes);
    }

    public function genToken(){
        $jwt = new \app\common\tool\JwtTool();
        $ttl = 1800;
        $more = ['name' => 'joker'];
        $res = $jwt->getCommonToken($ttl, $more);
        dump($res);
    }

    public function checkToken(){
        $token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6ImNvbW1vbiJ9.eyJpYXQiOjE1NTI1NTI4MTksIm5iZiI6MTU1MjU1MjgxOSwiZXhwIjoxNTUyNTU0NjE5LCJuYW1lIjoiam9rZXIifQ.pexFoNr6WMz_n0v0B4WT09y5ZWTl1U5aAqW2X0SLB9Q';
        $jwt = new \app\common\tool\JwtTool();
        $res = $jwt->checkCommonToken($token);
        dump($res);
    }

    public function strEncode(){
        $str = '10086';
        $baseService = new BaseService();
        $res = $baseService->encryptId($str);
        dump($res);
    }

    public function strDecode(){
        $str = '_e5SS';
        $baseService = new BaseService();
        $res = $baseService->decryptId($str);
        dump($res);
    }

    public function getOfficialAccountAccessToken(){
        $WxOfficialAccountService = new \app\common\service\WxOfficialAccountService();
        $accessToken = $WxOfficialAccountService->getWeChatAccessToken();
        error_log("token = ".print_r($accessToken,1)."\n",3,'/tmp/joker.log');
    }

}
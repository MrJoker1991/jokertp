<?php

namespace app\api\controller;


use app\common\controller\Base;

class ApiWrap extends Base
{
    /**
     * 成功
     */
    const RETURN_CODE_SUCCESS = 1;

    /**
     * 失败
     */
    const RETURN_CODE_ERROR = -1;

    /**
     * 需要授权ticket
     */
    const RETURN_CODE_NEED_LOGIN = -1000;

    /**
     * @var string 用户来源小程序
     */
    protected $_sourceKey = '';  //vote lottery hdj
    
    /**
     * 用户授权环境 xxx小程序  公众号h5
     * @var type 
     */
    protected $_env = '';//除了h5，没有时则使用source_key值

    /**
     * @var array 配置
     */
    protected $_config;

    /**
     * @var string 微信版本号
     */
    protected $_version;

    /**
     * @var string 当前用户的uid
     */
    protected $_uid = '';

    protected $_userInfoCacheTime = 2592000;

    public function __construct(\think\Request $request = null)
    {
        header('Content-Type:application/json; charset=utf-8');
        header("Access-Control-Allow-Origin:http://zs.huodongju.net");
        parent::__construct($request);
        if ($this->allowAccess()) {
            return true;
        } else {
            $this->ajaxError('登录过期，请重新登录',[],self::RETURN_CODE_NEED_LOGIN);
        }
    }

    /**
     * 是否可以直接访问
     * 在allow_access_module配置文件中直接配置
     * @return boolean
     */
    private function allowAccess()
    {
        $allowAccessModule = config("ALLOW_ACCESS_MODULE");
        $controller = request()->controller();
        $action = request()->action();
        $ticket = input('post.ticket');
        
        if(!empty($ticket)){
            $from = empty($this->_env)?$this->_sourceKey:$this->_env;            
            $ticketInfo = \think\Cache::get(\app\common\tool\RedisKey::YYZS_STRING_USER_TICKET_ . $from . '_' . $ticket);
            if (!empty($ticketInfo)) {
                $ticketInfo = json_decode($ticketInfo, true);
                $this->_uid = $ticketInfo['uid'];
                return true;
            }            
        }
        if (array_key_exists($controller, $allowAccessModule)) {
            if ($allowAccessModule[$controller] == "*") {
                return true;
            } elseif (in_array(strtolower($action), $allowAccessModule[$controller])) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 检查ticket是否有效
     * @return boolean
     */
    protected  function checkTicket(){
        $ticket = input('ticket');
        
        if(!empty($ticket)){
            $from = empty($this->_env)?$this->_sourceKey:$this->_env;        
            $exists = \think\Cache::has(\app\common\tool\RedisKey::YYZS_STRING_USER_TICKET_ . $from . '_' . $ticket);
            if (!empty($exists)) {
                return true;
            }            
        }        
        return false;
    }

    /**
     * 获取用户的uid
     * @param string $ticket
     * @return bool
     */
    protected function getUid($ticket = '')
    {
        if($this->_uid){
            return $this->_uid;
        }
        if(empty($ticket)){
            $ticket = input('post.ticket');
        }
        $from = empty($this->_env)?$this->_sourceKey:$this->_env;            
        $ticketInfo = \think\Cache::get(\app\common\tool\RedisKey::YYZS_STRING_USER_TICKET_ . $from . '_' . $ticket);
        if (!empty($ticketInfo)) {
            $ticketInfo = json_decode($ticketInfo, true);
            return $ticketInfo['uid'];
        }
        return 0;
    }
    
    /**
     * 
     * @param type $value
     */
    public function setSourceKey($value){
        if(!empty($value)){
            $this->_sourceKey = $value;
            $this->_env = input("env",$this->_sourceKey);
        }
    }
    /**
     * 
     * @return type
     */
    public function getSourceKey(){
        return $this->_sourceKey;
    }

    /**
     * 解析小程序提交的post请求
     * @return array
     */
    protected function getPostData()
    {
        $post = $_POST;
        if (empty($post)) {
            $rawpost = file_get_contents('php://input');
            $post = json_decode($rawpost, true);
            if (empty($post)) {
                $post = [];
                parse_str($rawpost, $post);
            }
        }
        return $post;
    }

    public function login($inner = false)
    {
        $loginType = input('post.loginType');
        $returnData = [
            'service_ver' => $this->_config['version']
        ];

        if ($loginType == 'ticket') {//通行证登录
            $ticket = input('post.ticket');
            if (!empty($ticket)) {
                $from = empty($this->_env)?$this->_sourceKey:$this->_env;
                $ticketInfo = \think\Cache::get(\app\common\tool\RedisKey::YYZS_STRING_USER_TICKET_ . $from . '_' . $ticket);
                if (!empty($ticketInfo)) {
                    $ticketInfo = json_decode($ticketInfo, true);
                    $returnData['need_auth'] = false;
                    $returnData['ticket'] = $ticket;
                    $returnData['nickname'] = $ticketInfo['nickname'];
                    $returnData['avatar'] = $ticketInfo['avatar'];
                } else {
                    $returnData['need_auth'] = true;
                }
            } else {
                $returnData['need_auth'] = true;
            }
        } elseif ($loginType == 'code') {//微信code登录
            $code = input('post.code');
            $res = file_get_contents('https://api.weixin.qq.com/sns/jscode2session?appid=' . $this->_config['app_id'] . '&secret=' . $this->_config['app_secret'] . '&js_code=' . rawurldecode($code) . '&grant_type=authorization_code');
            $data = json_decode($res, true);
            if (empty($data['openid'])) {
                $this->ajaxError('登录失败，请打开进入小程序');
            }
            $returnData['session_key'] = $data['session_key'];
            // 获取用户信息
            $userResult = $this->getUserByOpenid($data['openid']);
            if (empty($userResult)) {
                $returnData['need_auth'] = true;
            } else {
                $returnData['need_auth'] = false;
                $from = empty($this->_env)?$this->_sourceKey:$this->_env;            
                $returnData['ticket'] = $this->createUserTicket($userResult, $from);
                $returnData['nickname'] = $userResult['nickname'];
                $returnData['avatar'] = $userResult['avatar'];
            }
        } else {
            $this->ajaxError('系统异常');
        }

        if ($inner) {
            return $returnData;
        } else {
            $this->ajaxSuccess($returnData);
        }

    }

    /**
     * 更新用户信息
     */
    public function authUserInfo()
    {
        $post = input('post.');
        $sessionKey = input('post.session_key');
        if(empty($sessionKey)){
            $this->ajaxError('授权失败 E-100');
        }

        if (!empty($post['detail'])) {
            $detail = json_decode($post['detail'], true);
        }
        if (empty($detail) || empty($sessionKey) || empty($detail['encryptedData']) || empty($detail['iv'])) {
            $this->ajaxError('授权失败 E-101');
        }
        $encryptedData = rawurldecode($detail['encryptedData']);
        $iv = rawurldecode($detail['iv']);
        $userService = new \app\common\service\UserService();
        $res = $userService->auth($this->_config['app_id'], $sessionKey, $encryptedData, $iv, $this->_sourceKey);
        if ($res[0]) {
            $from = empty($this->_env)?$this->_sourceKey:$this->_env;            
            $this->ajaxSuccess(['ticket' => $this->createUserTicket($res[1], $from)]);
        } else {
            debug_log("授权失败：file".__FILE__.",line".__LINE__,true);
            debug_log($res,true);
            $this->ajaxError($res[1]);
        }
    }


    /**
     * 保存小程序表单推送id
     * @param array $formids
     */
    public function updateFormId($formids)
    {
        if(!is_array($formids)){
            $formids = [$formids];
        }
        $formidModel = model('Formid' . ucwords($this->_sourceKey));
        $saveData = [];
        foreach ($formids as $formid) {
            if($formid && is_string($formid) && $formid != 'the formId is a mock one'){
                array_push($saveData,[
                    'uid' => $this->getUid(),
                    'form_id' => $formid
                ]);
            }            
        }
        if (!empty($saveData)){
            $formidModel->saveAll($saveData,false);
        }
    }

    /**
     * 获取七牛上传token
     */
    public function getQiniuUploadToken()
    {
        $qiniuService = new \app\common\service\QiniuService();
        $token = $qiniuService->uploadToken(false, 86400);
        $this->ajaxSuccess($token);
    }

    /**
     * api 敏感词 外部接口 给前端调用
     */
    public function checkSensitiveWord()
    {
        $content = input('post.content');
        $blackList = \think\Config::get("BLACK_LIST");
        $whiteList = \think\Config::get("WHITE_LIST");
        $sf = new \app\common\tool\StringFilter($whiteList, $blackList);
        $this->ajaxSuccess($sf->check($content));
    }

    /**
     * 请求参数进行校验
     * @param string|array $name 字段名称或者规则数组
     *                            这里传递二维数组,就不需要传递rule规则，具体见官方文档说明
     * @param mixed $rule 验证规则
     * @param int $code 错误code 默认 -1
     *  [
     * ['mobile', 'require|isMobile', '手机号码不能为空|手机号码格式不正确']
     * ]
     * https://www.kancloud.cn/manual/thinkphp5/129356 文档规则
     */
    protected function checkValidate($name, $rule = '', $code = self::RETURN_CODE_ERROR)
    {
        $res = (new \app\common\validate\CheckValidate())->getRule($name, $rule);
        if ($res !== true) {
            $this->ajaxError($res, null, $code);
        }
    }

    /**
     * 创建用户ticket，并写入缓存
     * @param $userInfo
     * @param $env
     * @return bool|string
     */
    protected function createUserTicket($userInfo, $env)
    {
        $data = [
            'uid' => $userInfo['uid'],
            'openid' => $userInfo['openid'],
            'unionid' => $userInfo['unionid'],
            'nickname' => $userInfo['nickname'],
            'avatar' => $userInfo['avatar'],
            'timestamp' => time(),
        ];
        $ticket = md5(json_encode($data));
        $res = \think\Cache::set(\app\common\tool\RedisKey::YYZS_STRING_USER_TICKET_ . $env . '_' . $ticket, json_encode($data), $this->_userInfoCacheTime);
        if ($res) {
            return $ticket;
        } else {
            return false;
        }
    }


    /**
     * ajax请求成功输出
     *
     * @param array|object $data 下发数据 默认\stdClass
     * @param string $msg 返回文本信息
     * @param int $code 状态码 1成功 -1 失败
     */
    protected function ajaxSuccess($data = [], $msg = 'ok', $code = self::RETURN_CODE_SUCCESS)
    {
        $returnArray = array("code" => $code, "msg" => $msg);
        if (!empty($data)) {
            $returnArray['data'] = $data;
        }
        $this->ajaxReturn($returnArray);
    }

    /**
     * @param string $msg
     * @param array $data
     * @param int $code
     */
    protected function ajaxError($msg = '', $data = [], $code = self::RETURN_CODE_ERROR)
    {
        $returnArray = array("code" => $code, "msg" => $msg);
        if (!empty($data)) {
            $returnArray['data'] = $data;
        }
        $this->ajaxReturn($returnArray);
    }

    /**
     * Ajax方式返回数据到客户端
     * @param $data
     */
    protected function ajaxReturn($data)
    {
//        header('Content-Type:application/json; charset=utf-8');
        exit(json_encode($data));
    }


    /**
     * 获取用户信息
     * @param $openid
     * @throws \Exception
     */
    protected function getUserByOpenid($openid)
    {
        if (!$openid) {
            return false;
        }

        // 校验openid是否正确
        $userService = new \app\common\service\UserService();
        $userInfo = $userService->getUserInfoByOpenid($openid);
        if (!empty($userInfo)) {
            return $userInfo;
        }
        return false;
    }

    /**
     * 检查内容是否含有黑名单词 保留白名单词
     * @param string $content
     * @return boolean  true:合法  false：含有黑名单词组
     */
    protected function checkSensitiveWords($content)
    {
        $xssCheckContent = $this->dealSensitiveInputChar($content); //XSS 简单过滤
        if ($content != $xssCheckContent) {
            return false;
        }
        $stringFilter = config('string_filter');
        $blackList = $stringFilter['BLACK_LIST'];
        $whiteList = $stringFilter['WHITE_LIST'];
        $sf = new \app\common\tool\StringFilter($whiteList, $blackList);
        return $sf->check($content);
    }

    /**
     * 获取图片
     */
    public function getPic(){
        $imageUrl = input("request.url");
        header("Content-type: image/png;charset=utf-8");
        echo file_get_contents($imageUrl);
    }
}
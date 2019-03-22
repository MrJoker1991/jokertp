<?php

namespace app\index\controller;


use app\common\controller\Base;

class Wrap extends Base
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
     * @var string 当前用户的uid
     */
    protected $_uid = '';

    /**
     * post请求
     * @var
     */
    protected $post;


    public function __construct(\think\Request $request = null)
    {
        // header("Access-Control-Allow-Origin:http://zs.huodongju.net");
        parent::__construct($request);

        if ($this->allowAccess()) {
            // $domainUrl = config('DOMAIN_URL');
            // $wpPcDomain = config('WP_PC_DOMAIN');
            // $this->assign('domain_url', $domainUrl);
            // $this->assign('wp_pc_domain', $wpPcDomain);

            // $powerby = $this->getPowerby();
            // $this->assign("powerby",$powerby);
            return true;
        } else {
            $this->ajaxError('登录过期，请重新登录',[],self::RETURN_CODE_NEED_LOGIN);
        }
    }

    /**
     * 获取页面powerby渲染
     * @return string
     */
    private function getPowerby(){
        return '<a href="#" onclick="clickPowerby();" style="text-decoration-line:none;color:#999999;">页面技术由joker提供支持</a>';
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
        if(empty($ticket)){
            $ticket = input('get.ticket');
        }
        $from = empty($this->_env)?$this->_sourceKey:$this->_env;
        $ticketInfo = \think\Cache::get(\app\common\tool\RedisKey::YYZS_STRING_USER_TICKET_ . $from . '_' . $ticket);
        if (!empty($ticketInfo)) {
            $ticketInfo = json_decode($ticketInfo, true);
            return $ticketInfo['uid'];
        }
        return false;
    }

    /**
     * 创建用户ticket，并写入缓存
     * @param $userInfo
     * @return bool|string
     */
    protected function createUserTicketWithH5($userInfo)
    {
        $env = 'h5';
        $data = [
            'uid' => $userInfo['uid'],
            'openid' => $userInfo['openid'],
            'unionid' => $userInfo['unionid'],
            'nickname' => $userInfo['nickname'],
            'avatar' => $userInfo['avatar'],
            'source' => $env,
            'timestamp' => time(),
        ];
        $ticket = md5(json_encode($data));
        $res = \think\Cache::set(\app\common\tool\RedisKey::YYZS_STRING_USER_TICKET_  .$env. '_' . $ticket, json_encode($data), 86400 * 7);
        if ($res) {
            return $ticket;
        } else {
            return false;
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
        // return true;
        // $ticket = input('post.ticket');

        // if(!empty($ticket)){
        //     $from = empty($this->_env)?$this->_sourceKey:$this->_env;
        //     $ticketInfo = \think\Cache::get(\app\common\tool\RedisKey::YYZS_STRING_USER_TICKET_ . $from . '_' . $ticket);
        //     if (!empty($ticketInfo)) {
        //         $ticketInfo = json_decode($ticketInfo, true);
        //         $this->_uid = $ticketInfo['uid'];
        //         return true;
        //     }
        // }
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
     * ajax请求成功输出
     *
     * @param string $msg 返回文本信息
     * @param array|object $data 下发数据 默认\stdClass
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
     * @param array $data
     * @param string $msg
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
        header('Content-Type:application/json; charset=utf-8');
        exit(json_encode($data));
    }

    /**
     * 判断是否是微信浏览器
     * @return bool
     */
    protected function isWeixin(){
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        if (strpos($user_agent, 'MicroMessenger') === false) {
            // 非微信浏览器禁止浏览
            return false;
        } else {
            // 微信浏览器，允许访问
            return true;
        }
    }
    
    /**
     * 环境值获取，主要用于区分h5 与小程序其他 （vote lottery hdj）
     * @return type
     */
    protected function getEnv(){
        return $this->_env;
    }

}
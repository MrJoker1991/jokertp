<?php

namespace app\admin\controller;

class Index extends AdminWrap
{
    private $_homePath = "/admin/Index/index";

    public function __construct(\think\Request $request = null)
    {
        $this->_sourceKey = input("post.source_key","vote");
        $this->_env = input('env', $this->_sourceKey);        
        parent::__construct($request);
    }

    public function index(){
        $menuCrumbs = array(
            "first" => "欢迎页",
            "second" => array("menuName" => "欢迎页", "url" => "/admin/Index/index"),
        );
        $this->assign("menuCrumbs", $menuCrumbs);
        return $this->fetch("index");
    }

    public function login(){
        $httpReferer = input("server.HTTP_REFERER", '', 'base64_encode');
        $this->assign('referer', $httpReferer);
        return $this->fetch("login");
    }

    public function showConfig(){
        dump(request());
    }
    /**
     * 登录逻辑
     */
    public function toLogin() {
        // $this->checkVerifyCode();   //校验验证码
        if ($this->checkLogin(true)) {
            $httpReferer = input("param.referer", '', 'base64_decode');
            //@todo进一步判断本域名
            if (substr($httpReferer, 0, 4) == 'http' && false === stripos($httpReferer, "index/logout") && false === stripos($httpReferer, "index/tologin")) {
                $redirectUrl = $httpReferer;
            } else {
                $redirectUrl = url($this->_homePath);
            }
            $this->success('登录成功，进入系统...', $redirectUrl);
        } else {
            $this->error('登录失败,用户名或密码不正确', url('login'));
        }
    }

    /**
     * 获取验证码
     */
    public function getVerifyCode() {
        $captcha = new \think\captcha\Captcha();
        return $captcha->entry();
    }

    /**
     * 检验验证码
     * @param string $code 验证码字符串
     * @return boolean
     */
    private function checkVerifyCode($code = '') {
        if (empty($code)) {
            $code = input("post.code", "");
        }
        $captcha = new \think\captcha\Captcha();
        if (!$captcha->check($code)) {
            $this->error('验证码错误', url("login"));
        }
    }

    /**
     * 登出系统
     */
    public function logOut() {
        session_destroy();
        $this->success('成功退出系统', url('login'));
    }

    /**
     * 类似于noop
     */
    public function keepSe(){
        $t = time();
        session('lastAccessTime', $t);
        $this->ajaxSuccess(array('t' => $t));
    }

}
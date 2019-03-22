<?php

namespace app\index\controller;

use \app\common\service\WxOfficialAccountService;

class WxOfficialAccount extends Wrap {

    private $_wxofficialAccountService;

    public function __construct() {
        parent::__construct();
        $this->_wxofficialAccountService = new WxOfficialAccountService();
    }

    /**
     * 公众号接收消息入口
     */
    public function index() {
        $this->_wxofficialAccountService->serve();
    }

    /**
     * PC端微信登录二维码获取
     */
    public function getPcLoginQR(){
        $ticket = $this->_wxofficialAccountService->getPcLoginQR();
        if($ticket){
            $ret = array('ticket' => $ticket);
            $cacheService = new CacheService();
            $cacheService->setPcWxLogin($ticket);
            $this->ajaxSuccess('ok', $ret);
        }else{
            $this->ajaxError('error');
        }
    }

    public function getPcBindingQR(){
        $userId = $_SESSION['bindingUser'];
        $ticket = $this->_wxofficialAccountService->getPcBindingQR($userId);
        if ($ticket) {
            $ret = array('ticket' => $ticket);
            $cacheService = new CacheService();
            $cacheService->setPcWxBinding($ticket);
            $this->ajaxSuccess('ok', $ret);
        } else {
            $this->ajaxError('error');
        }
    }

}
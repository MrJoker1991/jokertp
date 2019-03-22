<?php

namespace app\common\service;
use WeChatSDK\Wechat;
use WeChatSDK\WechatApi;

/**
 * 微信公众号相关服务
 */
class WxOfficialAccountService extends BaseService {

    private $_wechat;
    private $_api;
    const SEND_CUSTOM = 0;
    const SEND_SUBSCRIBE = 1;
    const SEND_UNSUBSCRIBE = 2;

    private $_testService = [];


    /**
     * 客服消息类型定义
     * https://mp.weixin.qq.com/wiki?action=doc&id=mp1421140547&t=0.9705118413401503
     */
    /**
     * 文本
     */
    const MESSAGE_TEXT = 1;
    /**
     * 图片
     */
    const MESSAGE_IMAGE = 2;
    /**
     * 语音
     */
    const MESSAGE_VOICE = 3;
    /**
     * 视频
     */
    const MESSAGE_VIDEO = 4;
    /**
     * 音乐
     */
    const MESSAGE_MUSIC = 5;
    /**
     * 图文消息（点击跳转到外链）
     */
    const MESSAGE_NEWS = 6;
    /**
     * 卡券
     */
    const MESSAGE_WXCARD = 7;

    /**
     * 图文消息（点击跳转到图文消息页面）
     */
    const MESSAGE_MP_NEWS = 8;

    /**
     * WechatService constructor.
     * @param array $config 微信配置信息  $config['appid'] $config['appsecret']
     */
    public function __construct($config = array())
    {
        includeExtend("WeChatSDK.Wechat");
        includeExtend("WeChatSDK.WechatApi");
      
        if(empty($config)){
            $officialAccountConfig = config('official_account_config');
            $appId = $officialAccountConfig['appid'];
            $appSecret = $officialAccountConfig['appsecret'];
            $token = $officialAccountConfig['token'];
            $encodingAESKey = $officialAccountConfig['encoding_aes_key'];
        }else{
            $appId = $config['appid'];
            $appSecret = $config['appsecret'];
            $token = isset($config['token']) ? $config['token'] : '';
            $encodingAESKey = isset($config['encodingAESKey']) ? $config['encodingAESKey'] : '';
        }


        $this->_wechat = new Wechat(array(
            'appId' => $appId,
            'token' =>  $token,
            'encodingAESKey' => $encodingAESKey //可选
        ));

        $this->_api = new WechatApi(
            array(
                'appId' => $appId,
                'appSecret' => $appSecret,
                'get_access_token' => function($data){
                    $accessToken = CacheService::getOfficialAccountAccessToken($data[0]);
                    if ($accessToken) {
                        return $accessToken;
                    } else {
                        return false;
                    }
                },
                'save_access_token' => function($data) {
                    CacheService::setOfficialAccountAccessToken($data[0], $data[1]);
                },
                'get_jsapi_ticket' => function($data){
                    $accessToken = CacheService::getOfficialAccountAccessTicket($data[0]);
                    if ($accessToken) {
                        return $accessToken;
                    } else {
                        return false;
                    }
                },
                'save_jsapi_ticket' => function($data){
                    CacheService::setOfficialAccountAccessTicket($data[0], $data[1]);
                }
            )
        );
    }

    public function serve(){
        $msg = $this->_wechat->serve();
        $this->setActiveUsersInTwoDays($msg);   //记录48小时内互动过的用户
        if ($msg->MsgType == 'event' && $msg->Event == 'subscribe') {//关注
            if($msg->EventKey != null){
                $eventKey = substr($msg->EventKey, 8);
                if($eventKey == self::SCENE_ID_LOGIN){
                    $this->_subscribeLogin($msg);
                }else{
                    $key = substr($eventKey, 0, 4);
                    if($key == strval(self::SCENE_ID_BINDING)){
                        $userId = substr($eventKey, 4);
                        $this->_subscribeBinding($userId,$msg);
                    }elseif($key == self::SCENE_ID_BINDING_INVITATION){
                        $data = explode('_', $msg->EventKey);
                        $userId = $data[2];
                        $invitationId = $data[3];
                        $this->_subscribeBinding($userId, $msg);
                        $this->_sendInvitation($userId, $invitationId);
                    }elseif($key == self::SCENE_ID_INVITATION){
                        $data = explode('_', $msg->EventKey);
                        $userId = $data[2];
                        $invitationId = $data[3];
                        $this->_sendInvitation($userId, $invitationId);
                    }elseif($key == self::SCENE_ID_PC_INVITATION){
                        $data = explode('_', $msg->EventKey);
                        $invitationId = $data[2];
                        $this->_sendPcInvitation($invitationId, strval($msg->FromUserName));
                    }elseif($key == self::SCENE_ID_MESSAGE_BINDING){ // 留言扫码
                        $data = explode('_', $msg->EventKey);
                        $messageId = $data[2];
                        $userInfo = $this->_getUserInfo(strval($msg->FromUserName));
                        $this->_messageRelevance($messageId, $userInfo, $msg);
                    }elseif($key == self::SCENE_ID_BUY_TICKET){ // 留言扫码
                        $data = explode('_', $msg->EventKey);
                        $id = $data[2];
                        $this->_replyBuyTicket($id, $msg);
                    } elseif ($key == self::SCENE_ID_ACTIVITY) { // 活动扫码
                        $data = explode('_', $msg->EventKey);
                        $id = $data[2];
                        $userInfo = $this->_getUserInfo(strval($msg->FromUserName));
                        $this->_attentionActivity($id, $userInfo, $msg);
                    } else{
                        $this->_subscribe($msg);
                    }
                }
            }else{
                $this->_subscribe($msg);
            }
        } else if ($msg->MsgType == 'event' && $msg->Event == 'unsubscribe') {// 取消关注
            $this->_unsubscribe($msg);
        } else if ($msg->MsgType == 'event' && $msg->Event == 'SCAN') {//  用户已关注时的事件推送
            if($msg->EventKey == self::SCENE_ID_LOGIN){
                $this->_subscribeLogin($msg);
            }else{
                $key = substr(strval($msg->EventKey), 0, 4);
                if($key == self::SCENE_ID_BINDING){
                    $userId = substr($msg->EventKey, 4);
                    $this->_subscribeBinding($userId,$msg);
                }elseif($key == self::SCENE_ID_BINDING_INVITATION){ // 邀请函 已废除
                    $data = explode('_', $msg->EventKey);
                    $userId = $data[1];
                    $invitationId = $data[2];
                    $this->_subscribeBinding($userId, $msg);
                    $this->_sendInvitation($userId, $invitationId);
                }elseif($key == self::SCENE_ID_INVITATION){ // 邀请函 已废除
                    $data = explode('_', $msg->EventKey);
                    $userId = $data[1];
                    $invitationId = $data[2];
                    $this->_sendInvitation($userId, $invitationId);
                }elseif($key == self::SCENE_ID_PC_INVITATION){ // 邀请函 PC扫码处理
                    $data = explode('_', $msg->EventKey);
                    $invitationId = $data[1];
                    $this->_sendPcInvitation($invitationId, strval($msg->FromUserName));
                }elseif($key == self::SCENE_ID_MESSAGE_BINDING){ // 留言扫码
                    $data = explode('_', $msg->EventKey);
                    $messageId = $data[1];
                    $userInfo = $this->_getUserInfo(strval($msg->FromUserName));
                    $this->_messageRelevance($messageId, $userInfo, $msg);
                }elseif($key == self::SCENE_ID_BUY_TICKET){ // 留言扫码
                    $data = explode('_', $msg->EventKey);
                    $id = $data[1];
                    $this->_replyBuyTicket($id, $msg);
                } elseif ($key == self::SCENE_ID_ACTIVITY) { // 活动扫码
                    $data = explode('_', $msg->EventKey);
                    $id = $data[1];
                    $userInfo = $this->_getUserInfo(strval($msg->FromUserName));
                    $this->_attentionActivity($id, $userInfo, $msg);
                } else {
                    $this->_subscribe($msg);
                }
            }
        } else if ($msg->MsgType == 'event' && $msg->Event == 'CLICK') {//自定义菜单 CLICK事件
            if($msg->EventKey == 'Invitation'){
                $this->_sendInvitationLast($msg->FromUserName);
            }
        } else if ($msg->MsgType == 'event' && $msg->Event == 'LOCATION') {//上报地理位置事件

        } else if ($msg->MsgType == 'event' && $msg->Event == 'VIEW'){ //自定义菜单 VIEW事件

        } else if ($msg->MsgType == 'image'){ //图片消息
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "感谢宝宝的分享，稍后礼包就会送上哦，爱你~\n\n如果许久没有回复你！请不断后台轰炸我！\n\n我一定会出现的！等不及的小伙伴，可以添加vx：hdj-kf\n");
        } else if ($msg->MsgType == 'text'){ //文本消息
            $this->autoReply($msg);
        }
//        $this->send(self::MESSAGE_TEXT, $msg->FromUserName, '欢迎关注活动聚测试号');
    }

    public function getWechatQR($sceneId, $expire = 3600){
        $res = $this->_api->create_qrcode($sceneId, $expire);
        if($res){
            return $res->ticket;
        }
        return false;
    }

    public function getWechatPermanentQrcode($sceneId, $type = 'str'){
        $res = $this->_api->create_permanent_qrcode($sceneId, $type);
        if($res){
            return $res->ticket;
        }
        return false;
    }

    public function getWechatQrcodeUrlByTicket($ticket){
        if (!$ticket) {
            return false;
        }
        $url = $this->_api->get_qrcode_url($ticket);
        if($url){
            return $url;
        }
        return false;
    }

    /**
     * 登录二维码
     * @return bool
     */
    public function getPcLoginQR(){
        $res = $this->_api->create_qrcode(self::SCENE_ID_LOGIN, 3600);
        if($res){
            return $res->ticket;
        }
        return false;
    }

    /**
     * 绑定二维码
     * @param $userId
     * @return bool
     */
    public function getPcBindingQR($userId){
        $userId = $this->descryptId($userId);
        $res = $this->_api->create_qrcode(self::SCENE_ID_BINDING . $userId, 3600);
        if($res){
            return $res->ticket;
        }
        return false;
    }

    /**
     * 绑定账号且发送邀请函二维码
     * @param $userId
     * @param $invitationId
     * @return bool
     */
    public function getPcBindingInvitationQR($userId, $invitationId){
        $userId = $this->descryptId($userId);
        $res = $this->_api->create_qrcode(self::SCENE_ID_BINDING_INVITATION . '_' . $userId . '_' . $invitationId, 3600);
        if($res){
            return $res->ticket;
        }
        return false;
    }

    /**
     * 获取邀请函二维码
     * @param $invitationId 邀请函ID
     * @return bool
     */
    public function getPcInvitationQR($invitationId){
        $res = $this->_api->create_qrcode(self::SCENE_ID_PC_INVITATION . '_' . $invitationId, 3600);
        if($res){
            return $res->ticket;
        }
        return false;
    }

    public function uploadTempMedia($type, $path){
        $res = $this->_api->upload_media($type, $path);
        return $res;
    }


    /**
     * 客服消息回复 文案
     * @param $type
     * @param $openid
     * @param object $content
     */
    public function send($type, $openid, $content){
        if($type == self::MESSAGE_TEXT){  //1
            $object = array(
                "type" => 'text',
                "content" => $content
            );
            $this->_api->send($openid, $object);
        }else if($type == self::MESSAGE_IMAGE){
            $object = array(
                "type" => 'image',
                "media_id" => $content
            );
            return $this->_api->send($openid, $object);
        }else if($type == self::MESSAGE_VOICE){
        }else if($type == self::MESSAGE_VIDEO){
        }else if($type == self::MESSAGE_MUSIC){
        }else if($type == self::MESSAGE_NEWS){
            $object = array(
                "type" => 'news',
                "articles" => $content
            );
            return $this->_api->send($openid, $object);
        }else if($type == self::MESSAGE_MP_NEWS){
            $object = array(
                "type" => 'mpnews',
                "media_id" => $content
            );
            return $this->_api->send($openid, $object);
        }else if($type == self::MESSAGE_WXCARD){

        }
    }


//    public function send($type, $openid, $object = ''){
//        if($type == self::SEND_CUSTOM){
//            $this->_api->send($openid, $object);
//        }else if($type == self::SEND_SUBSCRIBE){
//            $this->_api->send($openid, '关注推送');
//        }
//    }


    private function _getUserInfo($openId)
    {
        $userService = new UserService();
        $info = $userService->getUserInfo('wx_openid', $openId);
        if (empty($info)){
            $res = $this->_api->get_user_info($openId);
            $wxUserInfo = array(
                "subscribe" => $res->subscribe,
                "openid" => $res->openid,
                "nickname" => $res->nickname,
                "sex" => $res->sex,
                "language" => $res->language,
                "city" => $res->city,
                "province" => $res->province,
                "country" => $res->country,
                "headimgurl" => $res->headimgurl,
                "subscribe_time" => $res->subscribe_time,
                "unionid" => $res->unionid,
                "remark" => $res->remark
            );
            $info = $userService->loginWithWxByWXUserInfo($wxUserInfo, UserService::PLATFORM_WX_SERVICE);
            $info = $info[1];
        }
        return $info;
    }

    /**
     * 关注公众号操作
     * @param $msg
     */
    private function _subscribe($msg){
        $userService = new UserService();
        $info = $userService->getUserInfo('wx_openid', strval($msg->FromUserName));
        if($info){
            $userService->toUpdateUserInfo($info['id'], array('wx_subscribe' => 1));
        }else{
            $wxInfo = $this->_api->get_user_info($msg->FromUserName);
            $userService->loginWithWxByWXUserInfo(json_decode(json_encode($wxInfo), true), UserService::PLATFORM_WX_SERVICE);
        }
        if ($this->dealAfterScanQrcodeByAdmin($msg)) {
            return;
        }
        $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "HI，你终于来了~\n\n做营销活动，上活动聚！\n\n集报名/投票/抽奖/预约等多类型活动工具，轻松开启互联网营销。\n\n【投票工具】→<a href='https://mp.weixin.qq.com/s/Ez4Nzjvp4kxCsphj38wdVg'>看日活10000+是如何做到的！</a>\n\n【预约工具】→<a href='https://mp.weixin.qq.com/s/OHpMjsfXxh51917VNg1v2Q'>服务升级，轻松管理客户信息</a>\n\n【开奖工具】→<a href='https://mp.weixin.qq.com/s/niMm76ZVtnFAeudLIPXFTw'>引流获客源头在这里！</a>\n\n【抽奖工具】→<a href='https://mp.weixin.qq.com/s/0GHosVgwoalNAr_-k8G1Dg'>人人参与的抽奖长这样！</a>\n\n【报名工具】→<a href='https://mp.weixin.qq.com/s/DC7o0-5g1yiA2kZK0PNpng'>上万场活动都是从这发出去！</a>\n\n一键领取活动神器→<a href='https://mp.weixin.qq.com/s/PARVNksOQBj5uhcB20kRdg'>活动聚小程序</a>");
    }

    /**
     * 扫描后台设置带参数二维码后
     */
    public function dealAfterScanQrcodeByAdmin($msg = ''){
        if (!empty($msg->EventKey)) {
            $msgEventKey = strval($msg->EventKey);       
            $wechatQrcodeModel = new \Hdjadmin\Model\WechatQrcodeModel();
            if ($msg->Event == 'subscribe') {
                $eventKey = substr($msgEventKey, 8);
            } elseif ($msg->Event == 'SCAN') {
                $eventKey = $msgEventKey;
            }
            $where = ['scene' => $eventKey, 'active' => 1, 'source' => 'hdj'];
            $res = $wechatQrcodeModel->baseFind($where);
            if ($res) {
                $msgFromUserName = strval($msg->FromUserName);
                $msgEvent = strval($msg->Event);
                //insert 记录
                $wechatQrcodeStatisticsModel = new \Hdjadmin\Model\WechatQrcodeStatisticsModel();
                $data = ['openid' => $msgFromUserName, 'type' => $msgEvent, 'scene' => $eventKey, 'source' => 'hdj'];
                $wechatQrcodeStatisticsModel->baseAdd($data);
                //是否回复
                if ($msgEvent == 'subscribe' && $res['new_reply']) {
                    $reply = $wechatQrcodeModel->dealReplyByType($res, 'new');
                    $this->send($res['new_reply_type'], $msgFromUserName, $reply);
                    return true;
                }
                if ($msgEvent == 'SCAN' && $res['old_reply']) {
                    $reply = $wechatQrcodeModel->dealReplyByType($res, 'old');
                    $this->send($res['old_reply_type'], $msgFromUserName, $reply);
                    return true;
                }
                return false;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    /**
     * 取消关注公众号操作
     * @param $msg
     */
    private function _unsubscribe($msg){
        $userService = new UserService();
        $info = $userService->getUserInfo('wx_openid', strval($msg->FromUserName));
        if($info){
            $userService->toUpdateUserInfo($info['id'], array('wx_subscribe' => 2));
        }else{
            $wxInfo = $this->_api->get_user_info($msg->FromUserName);
            $userService->loginWithWxByWXUserInfo(json_decode(json_encode($wxInfo), true), UserService::PLATFORM_WX_SERVICE);
        }
    }

    /**
     * PC扫码关注公众号绑定
     * @param $msg
     */
    private function _subscribeBinding($userId, $msg){
        $userService = new UserService();
        $cacheService = new CacheService();
        $userInfo = $userService->getUserInfo('wx_openid', strval($msg->FromUserName));
        if(!empty($userInfo)){
            $cacheService->setPcWxBinding($msg->Ticket, $userInfo['id']);
        }else{
            $info = $userService->getUserInfo('id', $userId);
            $wxInfo = $this->_api->get_user_info($msg->FromUserName);
            if($info){
                $data = array(
                    "wx_subscribe" => $wxInfo->subscribe,
                    "wx_openid" => $wxInfo->openid,
                    "wx_unionid" => $wxInfo->unionid,
                    "nick" => $wxInfo->nickname,
                    "wx_nick" => $wxInfo->nickname,
                    "icon" => $wxInfo->headimgurl,
                    "sex" => $wxInfo->sex,
                );
                $userService->toUpdateUserInfo($userId, $data);
                $cacheService->setPcWxBinding($msg->Ticket, $this->encryptId($userId));
            }else{
                $wxUserInfo = array(
                    "subscribe" => $wxInfo->subscribe,
                    "openid" => $wxInfo->openid,
                    "nickname" => $wxInfo->nickname,
                    "sex" => $wxInfo->sex,
                    "language" => $wxInfo->language,
                    "city" => $wxInfo->city,
                    "province" => $wxInfo->province,
                    "country" => $wxInfo->country,
                    "headimgurl" => $wxInfo->headimgurl,
                    "subscribe_time" => $wxInfo->subscribe_time,
                    "unionid" => $wxInfo->unionid,
                    "remark" => $wxInfo->remark,
                    "groupid" => $wxInfo->groupid,
                    "tagid_list" => $wxInfo->tagid_list
                );
                $info = $userService->loginWithWxByWXUserInfo($wxUserInfo, UserService::PLATFORM_WX_SERVICE);
                $cacheService->setPcWxBinding($msg->Ticket, $info['id']);
            }
        }
    }

    /**
     * PC扫码关注公众号登录
     * @param $msg
     */
    private function _subscribeLogin($msg){
        $userService = new UserService();
        $info = $userService->getUserInfo('wx_openid', strval($msg->FromUserName));
//        if($info && $info['subscribe'] == 0){
//            $userService->toUpdateUserInfo($info['id'], array('subscribe' => 1));
//        }else{
            $res = $this->_api->get_user_info($msg->FromUserName);
            $wxUserInfo = array(
                "subscribe" => $res->subscribe,
                "openid" => $res->openid,
                "nickname" => $res->nickname,
                "sex" => $res->sex,
                "language" => $res->language,
                "city" => $res->city,
                "province" => $res->province,
                "country" => $res->country,
                "headimgurl" => $res->headimgurl,
                "subscribe_time" => $res->subscribe_time,
                "unionid" => $res->unionid,
                "remark" => $res->remark,
                "groupid" => $res->groupid,
                "tagid_list" => $res->tagid_list
            );
            $info = $userService->loginWithWxByWXUserInfo($wxUserInfo, UserService::PLATFORM_WX_SERVICE);
//        }
        $cacheService = new CacheService();
        $cacheService->setPcWxLogin($msg->Ticket, $info[1]['id']);
    }

    /**
     * 创建菜单
     * @param $menuJson
     * @return array
     */
    public function createMenu($menuJson){
        if($_SERVER['HTTP_HOST'] == 'adminhdj.ygj.com.cn'){
            $toolService = new ToolService();
            $res = $toolService->getWeChatAccessTokenFromService();
            if($res['code'] == 1){
                return $this->_api->create_menu($menuJson, $res['data']['token']);
            }
        }else{
            return $this->_api->create_menu($menuJson);
        }
    }

    /**
     * 自动回复
     * @param $msg
     */
    public function autoReply($msg){

        $this->autoReplyByAdmin($msg);

    }

    /**
     * 发送模板消息
     * @param $data
     */
    public function sendTemplateMessage($data)
    {
        if(isTestServer()){
            $toolService = new ToolService();
            $res = $toolService->getWeChatAccessTokenFromService();
            if($res['code'] == 1){
                $this->_api->send_template_message($data, $res['data']['token']);
            }
        }else{
            $this->_api->send_template_message($data);
        }
    }

    /**
     * 获取access token
     * @return string
     */
    public function getWeChatAccessToken(){
        return $this->_api->get_access_token();
    }

    /**
     * 获取Jsapi 配置
     * @param $url
     * @return mixed
     */
    public function getJsapiConfig($url){
        return $this->_api->get_jsapi_config($url);
    }

    /**
     * 添加永久素材
     * @param $type
     * @param $path
     * @return array
     */
    public function addMaterial($type, $path){
        $res = $this->_api->add_material($type, $path);
        return $res;
    }

    /**
     * 获取素材列表
     * @param $type
     * @param $offset
     * @param $count
     * @return array
     */
    public function getMaterials($type, $offset, $count){
        return $this->_api->get_materials($type, $offset, $count);
    }

}
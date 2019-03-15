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
                    if (!in_array($_SERVER['HTTP_HOST'], array('wwwhdj.ygj.com.cn', 'wwwtshdj.ygj.com.cn'))) {
                        $cacheService = new CacheService();
                        $accessToken = $cacheService->getWxAccessTokenAllCache($data[0]);
                        if ($accessToken) {
                            return $accessToken;
                        } else {
                            $cacheService->delWxAccessTokenAllCache($data[0]);
                            return false;
                        }
                    }else{
                        return false;
                    }
                },
                'save_access_token' => function($data) {
                    $cacheService = new CacheService();
                    $cacheService->setWxAccessTokenAllCache($data[0], $data[1]);
                },
                'get_jsapi_ticket' => function($data){
                    $cacheService = new CacheService();
                    $accessToken = $cacheService->getWxTicketAllCache($data[0]);
                    if ($accessToken) {
                        return $accessToken;
                    } else {
                        $cacheService->delWxTicketAllCache($data[0]);
                        return false;
                    }
                },
                'save_jsapi_ticket' => function($data){
                    $cacheService = new CacheService();
                    $cacheService->setWxTicketAllCache($data[0], $data[1]);
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
     * 发送邀请函
     * @param $userId
     * @param $invId
     */
    private function _sendInvitation($userId, $invId = ''){
        $userService = new UserService();
        $userInfo = $userService->getUserInfo('id', $userId);
        $invitationService = new InvitationService();
        $invitationInfo = $invitationService->getInvitationById($invId);
        if(!empty($invitationInfo)){
            $this->send(self::MESSAGE_IMAGE, $userInfo['wx_openid'], $invitationInfo['media_id']);
        }else{
            $this->send(self::MESSAGE_TEXT, $userInfo['wx_openid'], "对不起，您还未制作邀请函，请访问活动聚官网 <a href='http://www.huodongju.com'>www.huodongju.com</a>");
        }
    }

    /**
     * 发送邀请函
     * @param $invId
     * @param $wx_openid
     */
    private function _sendPcInvitation($invId, $wx_openid){
        $invitationService = new InvitationService();
        $invitationInfo = $invitationService->getInvitationById($invId);
        if(!empty($invitationInfo)){
            $this->send(self::MESSAGE_IMAGE, $wx_openid, $invitationInfo['media_id']);
        }else{
            $this->send(self::MESSAGE_TEXT, $wx_openid, "对不起，该邀请函不存在，请重新获取");
        }
    }

    /**
     * 发送邀请函
     * @param $openid
     */
    private function _sendInvitationLast($openid){
        $userService = new UserService();
        $userInfo = $userService->getUserInfo('wx_openid', strval($openid));
        $invitationService = new InvitationService();
        $invitationInfo = $invitationService->getInvitationDetail(array('user_id'=>$userInfo['id']));
        if(!empty($invitationInfo)){

            if(!empty($invitationInfo['media_id']) && $invitationInfo['media_expire'] > time()){
                $this->send(self::MESSAGE_IMAGE, $userInfo['wx_openid'], $invitationInfo['media_id']);
            }else{
                $md5ImgFile = md5($invitationInfo['qiniu_path']);
                $md5ImgFile = 'Public/image/test/' . $md5ImgFile . '.png';
                $img = file_get_contents($invitationInfo['qiniu_path']);
                file_put_contents($md5ImgFile , $img);
                //需要处理生成文件失败
                $res = $this->uploadTempMedia('image', realpath($md5ImgFile));
                if($res->media_id){
                    unlink($md5ImgFile);
                    $data = array();
                    $data['id'] = $invitationInfo['id'];
                    $data['media_id'] = $res->media_id;
                    $data['media_expire'] = strtotime("+3 days");
                    $invitationService->updateInvitation($data);
                }else{
                    debug_log('生成邀请函失败 ID：' . $invitationInfo['id']);
                    $this->send(self::MESSAGE_TEXT, $userInfo['wx_openid'], "您的邀请函生成失败，请联系客服");
                }
                $this->send(self::MESSAGE_IMAGE, strval($openid), strval($res->media_id));
            }
        }else{
            $this->send(self::MESSAGE_TEXT, $userInfo['wx_openid'], "对不起，您还未制作邀请函，请访问活动聚官网 <a href='http://www.huodongju.com'>www.huodongju.com</a>");
        }
    }


    /**
     * 关联留言
     * @param $messageId
     * @param $userInfo
     * @param $msg
     */
    private function _messageRelevance($messageId, $userInfo, $msg){
        if (!empty($userInfo)) {
            $baseService = new BaseService();
            $messageModel = new ActivityMessageModel();
            $messageModel->baseSave(array('id' => $messageId), array('user_id' => $baseService->descryptId($userInfo['id']), 'user_avatar' => $userInfo['icon'], 'user_nick' => $userInfo['nick']));
            $cacheService = new CacheService();
            $cacheService->setMessageQR($messageId, 1);
        }
        $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "Hi,你来啦。\n主办方收到您的留言啦，回复后将在第一时间通知您。");
    }

    /**
     * 回复买票
     * @param $id
     * @param $msg
     * @throws \Think\Exception
     */
    private function _replyBuyTicket($id, $msg){
        $cacheService = new CacheService();
        $cacheService->setPcBuyTicketQR($id,1);
        $ticketInfo = $cacheService->getPcBuyTicketInfo($id);
        $activityService = new ActivityService();
        $activityInfo = $activityService->getActivityInfo(array('id'=>$ticketInfo['activityId']));
        $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "Hi,你来啦。\n您正在报名参加《".$activityInfo['title']."》，<a href='". U('Wx', '', false, true). 'Activity/getActivitySignViewByQr?id=' . $id  ."'>点击这里</a>完成购票");
    }

    /**
     * 扫码关注活动
     * @param $aid
     * @param $userInfo
     * @param $msg
     * @throws \Think\Exception
     */
    private function _attentionActivity($aid, $userInfo, $msg){
        $activityService = new ActivityService();
        $userFollowService = new UserFollowService();
        $activityInfo = $activityService->getActivityInfo(array('id'=>$aid));
        $data = array();
        $data['user_id'] = $this->descryptId($userInfo['id']);
        $data['type'] = 1;
        $data['follow_id'] = $this->descryptId($aid);
        $userFollowService->addFollow($data);
        $this->send(self::MESSAGE_TEXT,  $msg->FromUserName, "Hi,你来啦。\n您关注活动《<a href='". U('Wx', '', false, true). 'Activity/activityDetail/id/'.$aid.'/?id=' . $aid  ."'>".$activityInfo['title']."</a>》，记得准时参加哦");
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
     * 记录48小时内互动过的用户
     */
    public function setActiveUsersInTwoDays($msg){
        $openid = strval($msg->FromUserName);
        $cacheService = new CacheService();
        $cacheService->setActiveUsersInTwoDays('hdj', $openid);
    }

    /**
     * 获取48小时内互动过的用户
     */
    public function getActiveUsersInTwoDays(){
        $cacheService = new CacheService();
        $activeUsers = $cacheService->getActiveUsersInTwoDays('hdj');
        return $activeUsers;
    }

    /**
     * 给48小时内互动过的用户推送消息
     */
    public function sendMessageToActiveUsersInTwoDays($contentType = '1'){
        $activeUsers = $this->getActiveUsersInTwoDays();
        $totalNum = count($activeUsers);
        $successNum = 0;
        $failNum = 0;
        if (!empty($activeUsers)) {
            if ($contentType != '1') {
                $contentArr = [
                    [
                        'type' => self::MESSAGE_TEXT,
                        'content' => '三七、三八节倒计时......\n年后活动强心剂，不能错过！\n还怕节前做不好活动？上活动聚，一键生成你的专属活动，快速增粉，精准拓客！不要错过啦\n【免费用】扫码进入：\n'
                    ],
                    [
                        'type' => self::MESSAGE_IMAGE,
                        'content' => 'PigNLkgLTTFlcSNKr9ux7YWrhGoDmUWI21c_tooMcb4'
                    ],
                    [
                        'type' => self::MESSAGE_TEXT,
                        'content' => '福利领取：\n回复：礼包，获取活动营销干货\n回复：表格，获取1000+涵盖多行业的Excel模板案例\n免费福利不断更新中，记得常回来看看~\n'
                    ],
                ];
            } else {
                $contentArr = [
                    [
                        'type' => self::MESSAGE_TEXT,
                        'content' => '还怕节前做不好活动？快来骚扰客服，手把手教您做活动，快速增粉，精准拓客！不要错过啦\n推送微信号：可雅号\n'
                    ],
                    [
                        'type' => self::MESSAGE_IMAGE,
                        'content' => 'PigNLkgLTTFlcSNKr9ux7bzRAFiSdceRcniIzKffG00'
                    ],
                ];
            }

            //开始发送
            foreach ($activeUsers as $oneUser) {
                $hasFail = false;
                foreach ($contentArr as $oneContent) {
                    $sendRes = $this->send($oneContent['type'], $oneUser, $oneContent['content']);
                    if (is_array($sendRes) && isset($sendRes[0]) && is_object($sendRes[0]) && isset($sendRes[0]->errcode) && $sendRes[0]->errcode) {
                        $hasFail = true;
                    }
                }
                $hasFail ? $failNum++ : $successNum++;
            }

        }
        return ['totalNum' => $totalNum, 'successNum' => $successNum, 'failNum' => $failNum];
    }


    /**
     * 自动回复
     * @param $msg
     */
    public function autoReply($msg){

        if ($msg->Content == '2019') {  //2018年12月26日 新增
            $this->send(self::MESSAGE_MP_NEWS, $msg->FromUserName, "PigNLkgLTTFlcSNKr9ux7R6NKmNSDhH75rECOQNsKmo");
        } else if ($msg->Content == '12') { //2018年11月30日09:31 新增
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "【活动聚】12月活动营销指导方案，添加客服微信号：hdj-kf（或长按下图二维码添加），备注“12”，获取营销PPT。");
            $this->send(self::MESSAGE_IMAGE, $msg->FromUserName, "PigNLkgLTTFlcSNKr9ux7XvZkmyddTvIj1hzFaAeIWI");
        } else if ($msg->Content == '精选') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "活动营销精选超值大礼包，下载链接: https://pan.baidu.com/s/1wUvSOPi5GCSeS4f6FIPSRQ 提取码: vdb4 \n\n感谢您的到来，更多福利等你领：\n回复“0102”，获取100套旅游类活动、景区活动组织策划干货；\n回复“0518”，获取150套团建活动方案，集体活动&团建活动&暖场活动策划大全；\n回复“0408”，获取上百套创意高端PPT合集。\n回复“12”，免费获取12月互动营销指导方案\n\n一键领取活动神器→<a href='https://mp.weixin.qq.com/s/PARVNksOQBj5uhcB20kRdg'>活动聚小程序</a>");
        } else if ($msg->Content == '0102') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "100套旅游类活动景区活动策划干货，下载链接：https://pan.baidu.com/s/1XYGUuU25SOWxewY93UBA_g 提取密码: b9a3 \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '0518') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "150套团建活动方案/集体活动/团建暖场游戏活动策划大全，下载链接: https://pan.baidu.com/s/1zy3uV2W8vzC-LsIUsJn4LA 提取密码：uinq \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '0307') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "2018年最新青少年夏令营活动策划60套干货资料，下载链接：https://pan.baidu.com/s/12JiLq8Cti1dsmcCTjN2nag 提取密码：a56h \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '0408') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "上百套创意高端ppt合集，赶紧MARK。下载链接：https://pan.baidu.com/s/1YNW1uYtzxsU-ZWTqmOnZ7Q 密码：el2l \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '审核') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "您好，您的活动发布后可直接分享给好友了哦~\n如需被推荐到首页，需耐心等待小编审核（工作日1-6小时内，周末24小时内）；被推荐后您将会收到系统推送的通知。\n送上我们的审核推荐标准，您可以先查看：https://mp.weixin.qq.com/s/Ukkc-gjqXBOPPNT6zZso2A");
        } elseif ($msg->Content == '营销') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "活动营销精选超值大礼包，下载链接: https://pan.baidu.com/s/1wUvSOPi5GCSeS4f6FIPSRQ 提取码: vdb4 \n干货到手了，记得花样行动起来！\n\n一键领取活动神器→<a href='https://mp.weixin.qq.com/s/PARVNksOQBj5uhcB20kRdg'>活动聚小程序</a>");
        } //old
        else if (strcasecmp($msg->Content, 'gina') == 0) {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "Gina的个人微信号：Im_Gina7");
        } elseif (strcasecmp($msg->Content, 'rabi') == 0) {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "RabiQ的邮箱是：rabbit_oe@live.cn\n个人公众号是：【不得了的蜜柑】\n（微信号：impressive_org）");
        } elseif (strcasecmp($msg->Content, '邀请函') == 0) {
            $this->_sendInvitationLast($msg->FromUserName);
        } elseif (strcasecmp($msg->Content, '策划案') == 0) {  //#2017年10月11日 运营新增规则 http://wiki.qianyewang.com:8080/browse/HDJOP-597
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "1000套活动庆典策划方案，\n下载链接： https://pan.baidu.com/s/1miqqhuC 密码: nedg \n\n 在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动。<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚 App</a>\n\n继续回复关键词：\n案例+您的微信号\n免费获取40套高端精美的活动策划案PPT。");
        } elseif ($msg->Content == '0419') {  //#2018年4月20日 运营新增规则 http://wiki.qianyewang.com:8080/browse/HDJ-4978
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "100套旅游类活动景区活动策划干货，下载链接：https://pan.baidu.com/s/1XYGUuU25SOWxewY93UBA_g  提取密码: b9a3 \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '0420') {  //#2018年4月20日 运营新增规则 http://wiki.qianyewang.com:8080/browse/HDJ-4978
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "2018年最新青少年夏令营活动策划60套干货资料，下载链接：https://pan.baidu.com/s/12JiLq8Cti1dsmcCTjN2nag 提取密码：a56h \n\n 在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '0421') {  //2018年4月20日 运营新增规则 http://wiki.qianyewang.com:8080/browse/HDJ-4978
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "150套团建活动方案/集体活动/团建暖场游戏活动策划大全，下载链接: https://pan.baidu.com/s/1zy3uV2W8vzC-LsIUsJn4LA  提取密码：uinq \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif (strstr($msg->Content, '案例')) {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "40套高端活动策划案PPT下载链接：https://pan.baidu.com/s/1mh7APUK 密码: 8bmm");
        } elseif ($msg->Content == '0706' || $msg->Content == '0304') { //2018年7月10日 运营新增规则 http://wiki.qianyewang.com:8090/pages/viewpage.action?pageId=21010872
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "超全的活动策划知识与上百个经典案例学习，链接: https://pan.baidu.com/s/1pAkh1D5ZS1YtIEPAKQuj7g 密码：wa4h \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '0722') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "互联网企业线上活动案例集合分析，链接: https://pan.baidu.com/s/1NRH6bJjydMx2WsgjYcaEPw 密码：bme4 \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '0721' || $msg->Content == '0618') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "上百套创意高端ppt合集，赶紧MARK，链接: https://pan.baidu.com/s/1YNW1uYtzxsU-ZWTqmOnZ7Q 密码：el2l \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == 'H5') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "六大好用的H5页面制作工具：https://mp.weixin.qq.com/s/c9JmCHAkRx8WYiT6zlKi8A \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '0101') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "当下有趣好玩的八大兼职：https://mp.weixin.qq.com/s/Pgt3mmJLzFiOlEeecdGgIg \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '0202') {
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "10套简历模板 链接: https://pan.baidu.com/s/1_SmFE0MNgQEpTyhpSw9PRA 密码: s25f \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，<a href='http://a.app.qq.com/o/simple.jsp?pkgname=com.xingluo.party'>立即体验活动聚App</a>");
        } elseif ($msg->Content == '路口'){
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "14天零基础公众号速成课+工具使用福利 \n\n链接: https://pan.baidu.com/s/1rW20Z7oucMcO0mDn2Ify8w 密码: x2k9 \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，立即体验活动聚App。");
        } elseif ($msg->Content == '人物'){
            $this->send(self::MESSAGE_TEXT, $msg->FromUserName, "<a href='https://mp.weixin.qq.com/s?__biz=MzI2ODU0NDI2OA==&mid=100001655&idx=1&sn=a048a24022d6a0b192a2123456ec9e76&chksm=6aecb7145d9b3e02b2dd83fc4f84b6eb200ef668644b27b34d818c07f6e4bf910fd072cdea3d'>有趣的灵魂都在这里，一起来捕获！</a> \n\n在【我的活动聚】—【发现活动】页面，发现更多创意趣味活动；\n下载活动聚APP，轻松发布和管理活动，立即体验活动聚App。");
        } else {
            $this->autoReplyByAdmin($msg);
        }


    }

    /**
     * 自动回复 (后台配置)
     */
    public function autoReplyByAdmin($msg){
        $key = trim(strval($msg->Content));

        $where = ['key' => $key, 'active' => 1, 'source' => 'hdj'];
        $wechatAutoReplyModel = new \Hdjadmin\Model\WechatAutoReplyModel();
        $res = $wechatAutoReplyModel->baseGet($where, '*', ['order' => 'asc']);
        if($res){
            foreach ($res as $oneReply) {
                $type = $oneReply['type'];
                $reply = $wechatAutoReplyModel->dealReplyByType($oneReply);
                $this->send($type, $msg->FromUserName, $reply);
            }
        }
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
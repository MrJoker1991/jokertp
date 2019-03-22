<?php

namespace app\common\service;


class UserService extends BaseService
{

    public function __construct()
    {
        parent::__construct();
        $this->_model = new \app\common\model\User();
    }

    public function getModel()
    {
        return $this->_model;
    }

    public function auth($appId, $sessionKey, $encryptedData, $iv, $source)
    {
        vendor("wxAuth.wxBizDataCrypt");
        $pc = new \WXBizDataCrypt($appId, $sessionKey);
        $errCode = $pc->decryptData($encryptedData, $iv, $finalData);
        if ($errCode == 0) {
            $finalData = json_decode($finalData, true);
            $userData = [
                //'openID'    => $finalData['openid'],  // 不用更新
                'nickname' => $finalData['nickName'],
                'gender' => $finalData['gender'],
                'avatar' => $finalData['avatarUrl'],
                'city' => $finalData['city'],
                'province' => $finalData['province'],
                'country' => $finalData['country'],
            ];
            if (!empty($finalData['unionId'])) {
                $userData['unionid'] = $finalData['unionId'];
            }
            $userService = new \app\common\service\UserService();
            $userResult = $userService->updateInfoElseAdd($userData, $finalData['openId'], $source);
            if ($userResult === false) {
                return [false, '授权失败'];
            } else {
                return [true, ['uid' => $userResult, 'unionid' => $finalData['unionId'], 'openid' => $finalData['openId'], 'nickname' => $finalData['nickName'], 'avatar' => $finalData['avatarUrl']]];
            }
        } else {
            debug_log("授权失败：file".__FILE__.",line".__LINE__,true);
            debug_log($errCode,true);
            return [false, '授权失败'];
        }
    }

    /**
     * 公众号授权
     * @param $userInfo
     * @return array
     * @throws \Exception
     */
    public function h5Auth($userInfo)
    {
        $userData = [
            'nickname' => $userInfo['nickname'],
            'gender' => $userInfo['sex'],
            'avatar' => $userInfo['headimgurl'],
            'city' => $userInfo['city'],
            'province' => $userInfo['province'],
            'country' => $userInfo['country'],
            'unionid' => $userInfo['unionid']
        ];
        if(!empty($userData) && isset($userData['unionid'])){
            $userService = new \app\common\service\UserService();
            $userResult = $userService->updateInfoElseAdd($userData, $userInfo['openid'], 'h5');
        }else{
            $userResult = false;            
        }
        if ($userResult === false) {
            return [false, '授权失败'];
        } else {
            return [true, ['uid' => $userResult, 'unionid' => $userInfo['unionid'], 'openid' => $userInfo['openid'], 'nickname' => $userInfo['nickname'], 'avatar' => $userInfo['headimgurl']]];
        }
    }


    /**
     * 更新用户数据 如果用户信息不存在，则插入数据
     * @param $data
     * @param $openid
     * @param $source
     * @return bool|mixed
     * @throws \Exception
     */
    public function updateInfoElseAdd($data, $openid, $source)
    {
        $userInfo = $this->getInfoByUnionId($data['unionid']);
        try {
            $this->startTrans();
            if (empty($userInfo)) {
                $res = $uid = $this->addUserInfo($data);
                $this->addUserOpenidInfo($uid, $openid, $source);
                if ($res) {
                    $this->commit();
                    return $uid;
                }
            } else {
                $res = $this->updateUserInfo($userInfo['id'], $data);
                $uid = $userInfo['id'];
                $userOpenidModel = new \app\common\model\UserOpenid();
                $info = $userOpenidModel->baseFind(['openid' => $openid]);
                if (empty($info)) {
                    $this->addUserOpenidInfo($uid, $openid, $source);
                }
                if ($res !== false) {
                    $this->commit();
                    return $uid;
                }                
            }
            return false;
        } catch (\Exception $ex) {
            $this->rollback();
            s_exception('更新用户数据失败');
        }
    }


    public function getUidByOpenid($openid)
    {
        $where = ['openid' => $openid];
        return $this->_model->baseRelationFind('UserOpenid', 'uid', 'id', $where);
    }

    /**
     * 通过uid获取用户信息
     * @param $uid
     * @param string $field
     * @return array|bool|false|\PDOStatement|string|\think\Model
     */
    public function getInfoById($uid, $field = "*")
    {
        try {
            return $this->_model->baseFind(['id' => $this->decryptId($uid)], $field);
        } catch (\Exception $ex) {
            return false;
        }
    }

    public function getInfoByUnionId($unionId)
    {
        $where = ['unionid' => $unionId];
        return $this->_model->baseFind($where);
    }

    /**
     * 根据openid 查询是否存在用户 关联user表查询
     * @param $openid
     * @return array|bool|false|\PDOStatement|string|\think\Model
     * @throws \Exception
     */
    public function getUserInfoByOpenid($openid)
    {
        if (empty($openid)) {
            return false;
        }
        $where = ['openid' => $openid];
        try {
            return $this->_model->baseRelationFind('UserOpenid', 'uid', 'id', $where, ['User.*', 'UserOpenid.*']);
        } catch (\Exception $ex) {
            s_exception('获取用户信息失败');
        }
    }
    
    /**
     * 根据用户的uid获取openid
     * @param $uid
     * @return mixed
     * @throws \Exception
     */
    public function getUserInfoByUid($uid, $source)
    {
        $userInfoModel = new \app\common\model\User();
        $userInfo = $userInfoModel->baseRelationFind(
            'UserOpenid', 'uid', 'id',
            ['User.id' => $uid, 'UserOpenid.source' => $source],
            ['User.*', 'UserOpenid.*']);
        return $userInfo;
    }
    /**
     * @param array $where
     * @param string $field
     * @param int $page
     * @param int $rows
     * @param array $order
     * @return array
     * @throws \Exception
     */
    public function getUserListPage($where = array(), $field = "*", $page = 1, $rows = 10, $order = array())
    {
        try {
            return $this->_model->baseSelectPage($where, $field, $page, $rows, $order);
        } catch (\Exception $ex) {
            s_exception('获取用户信息失败');
        }
    }

    /**
     * @param array $where
     * @param string $field
     * @param int $page
     * @param int $rows
     * @param array $order
     * @return array
     * @throws \Exception
     */
    public function getUserOpenidListPage($where = array(), $field = "*", $page = 1, $rows = 10, $order = array())
    {
        try {
            $model = new \app\common\model\UserOpenid();
            return $model->baseSelectPage($where, $field, $page, $rows, $order);
        } catch (\Exception $ex) {
            s_exception('获取用户信息失败');
        }
    }

    /**
     * 添加User
     * @param $data
     * @return mixed
     * @throws \Exception
     */
    public function addUserInfo($data)
    {
        return $this->_model->baseAdd($data);
    }

    /**
     * 更新User信息
     * @param $id
     * @param $data
     * @return $this|bool
     * @throws \Exception
     */
    public function updateUserInfo($id, $data)
    {
        return $this->_model->baseUpdateById($id, $data);
    }

    public function addUserOpenidInfo($uid, $openid, $source)
    {
        $userOpenidModel = new \app\common\model\UserOpenid();
        return $userOpenidModel->baseAdd(['uid' => $uid, 'openid' => $openid, 'source' => $source]);
    }


    /**
     * get小程序发送模板前的 access_token
     * 详见 https://developers.weixin.qq.com/miniprogram/dev/api/notice.html#发送模板消息
     * @param $source
     * @return mixed
     * @throws \Exception
     */
    public function getWxAccessToken($source)
    {
//        https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
//        {"access_token": "ACCESS_TOKEN", "expires_in": 7200}
        if (empty($source)) {
            s_exception('来源不能为空');
        }
        $access_token_url = "https://api.weixin.qq.com/cgi-bin/token"; // 获取微信token地址

        $cacheKey = \app\common\tool\RedisKey::YYZS_STRING_ACCESS_TOKEN . $source;

        // 判断当前不是正式环境，去正式环境获取accessToken
        $accessToken = '';
        //测试环境从正式环境获取accesstoken
        $accessToken = $this->getMiniAccessTokenFromRelease($cacheKey);
        if($accessToken){
            return $accessToken;
        }

        if (empty($accessToken)) {
            $accessToken = \think\Cache::get($cacheKey);
        }

        if (!$accessToken) {
            $miniConfig = config($source . '_config');
            $accessTokenUrl = $access_token_url . '?grant_type=client_credential' . '&appid=' . $miniConfig['app_id'] . '&secret=' . $miniConfig['app_secret'];
            $accessTokenRes = json_decode(\app\common\tool\HttpTool::get($accessTokenUrl), true);
            if (!isset($accessTokenRes['access_token']) || empty($accessTokenRes['access_token'])) {
                //        {"errcode": 40013, "errmsg": "invalid appid"}
                //{"errcode":40029,"errmsg":"invalid code"}
//                s_exception(json_encode($accessTokenRes), 1041);
                s_exception("获取小程序access token失败", 1041);
            }
            $accessToken = $accessTokenRes['access_token'];
            // 更新缓存数据
            \think\Cache::set($cacheKey, $accessToken, 7200);//在7200秒- 2小时之前失效
        }
        return $accessToken;
    }
    
    /**
     * 从正式服务器获取对应小程序accesstoken
     * @param type $cacheKey $cacheKey = \app\common\tool\RedisKey::YYZS_STRING_ACCESS_TOKEN . $source;
     * @return type
     */
    private function getMiniAccessTokenFromRelease($cacheKey){
        $accessToken = '';
        if (config('app_status') != 'release') {

            $postUrl = 'https://zsapp.huodongju.com/zs/api/index/getReleaseAccessToken';

            $res = \app\common\tool\HttpTool::post($postUrl, [
                'cache_key' => $cacheKey,
                'secret_key' => 'yyzs-chinese-secret-key'
            ]);
            $resJson = json_decode($res, true);
            if ($resJson['code'] != -1) {
                // 有数据获取成功
                $accessToken = $resJson['data']['access_token'];
            }
        }
        return $accessToken;
    }

    /**
     * 同步活动聚用户服务
     * @param array $hdjUserInfo 活动聚用户信息 来源 hd_user表 全字段
     * @return array map_info ['id'=>'','hdj_id'=>'','zs_id'=>"",'create_time'=>""]
     */
    public function syncHdjUser($hdjUserInfo){
        debug_log("syncHdjUser");
        debug_log($hdjUserInfo);
        $toSetMapFlag = false;//更新映射信息
        $useridMapModel= new \app\common\model\UseridMap();
        $mapInfo = $useridMapModel->baseFind(['hdj_id'=>$hdjUserInfo['id']]);
//        debug_log($mapInfo);
        //userid_map 存在该活动聚用户的映射记录
        if(isset($mapInfo['zs_id']) && !empty($mapInfo)){
            debug_log("map record found.");
            if($mapInfo['wx_unionid'] != $hdjUserInfo['wx_unionid']){
                //删除已有映射，并重新设置映射
                $delRes = $useridMapModel->baseDel($mapInfo['id']);
                if($delRes !== false){
                    debug_log("wx unionid different, del map info [id=".$mapInfo['id']."] success.");
                    $toSetMapFlag = true;
                }
            }
        }else{
            debug_log("map record not found.");
            $toSetMapFlag = true;
        }
        
        if($toSetMapFlag){
            debug_log("to set user id map.");
            $this->startTrans();
            //检查yyzs_user表 unionid相同的活动助手用户
            $userModel = $this->_model;
            $zsUserInfo = $userModel->baseFind(["unionid"=>$hdjUserInfo['wx_unionid']],["id"]);
//            debug_log($zsUserInfo);
            
            if(isset($zsUserInfo['id']) && !empty($zsUserInfo['id'])){
                debug_log("unionid found in yyzs_user table.[id=".$zsUserInfo['id']."]");
                $zsUid = $zsUserInfo['id'];
            }else{
                debug_log("unionid not found in yyzs_user table.");
                //活动助手不存在unionid相同的用户，注册用户到活动助手user表
                $zsUserData = [
                    'unionid'=>$hdjUserInfo['wx_unionid'],
                    'nickname'=>$hdjUserInfo['wx_nick'],
                    'avatar'=>preg_replace("/^http:\/\//", "https://",$hdjUserInfo['icon']),
                    'gender'=>$hdjUserInfo['sex'],
                    'tel'=>$hdjUserInfo['phone'],
                    'province'=>$hdjUserInfo['province'],
                    'city'=>$hdjUserInfo['city'],
                ];
                $addZsUid = $this->addUserInfo($zsUserData);
                if($addZsUid){
                    debug_log("new yyzs user success.");
                    $zsUid = $addZsUid;
                }else{
                    debug_log("new yyzs user failed.");
                    $this->rollback();
                    s_exception("zs uid add failed.");
                }
            }
            
            if($zsUid){
                //userid_map新增映射记录
                $mapId = $useridMapModel->baseAdd(['hdj_id'=>$hdjUserInfo['id'],'zs_id'=>$zsUid,"wx_unionid"=>$hdjUserInfo['wx_unionid']]);
                debug_log("new map id:".$mapId);
                if($mapId){
                    $mapInfo = ['id'=>$mapId,'hdj_id'=>$hdjUserInfo['id'],'zs_id'=>$zsUid,'create_time'=>time()];
//                    debug_log($mapInfo);
                }else{
                    $this->rollback();
                    s_exception("add userid_map failed.");
                }
            }else{
                $this->rollback();
                s_exception("zs uid empty.");
            }
            $this->commit();
            
        }
        return $mapInfo['zs_id'];
        
    }
    
    /**
     * 通过活动聚用户id获取在活动助手上的用户id
     * @param type $hdjId
     * @return string
     */
    public function getUidByHdjId($hdjId){
        $useridMapModel= new \app\common\model\UseridMap();
        $mapInfo = $useridMapModel->baseFind(['hdj_id'=>$hdjId]);        
        if(isset($mapInfo['zs_id']) && !empty($mapInfo['zs_id'])){
            return $mapInfo['zs_id'];
        }
        return '';
    }
    
    
    /**
     * 个人活动信息概览
     * @param type $uid
     * @return array
     */
    public function getActivitiesOverview($uid){
        $overview = ['vote'=>[],'lottery'=>[],'yuyue'=>[],'kaijiang'=>[]];
        
        if($uid){
            $cacheService = new CacheService();
            $overview = $cacheService->getUserOverviewInfo($uid);
            if(empty($overview)){
                $voteActivityModel = new \app\common\model\VoteActivity();
                $overview['vote']['activity_count'] = $voteActivityModel->baseCount(['uid'=>$uid,'status'=>['neq', \app\common\model\VoteActivity::STATUS_DELETE], 'preview' => 0]);
                $lotteryActivityModel = new \app\common\model\LotteryActivity();
                $overview['lottery']['activity_count'] = $lotteryActivityModel->baseCount(['uid'=>$uid,'status'=>['neq', \app\common\model\LotteryActivity::STATUS_DELETE]]);
                $yuyueActivityModel = new \app\common\model\YuyueActivity();
                $overview['yuyue']['activity_count'] = $yuyueActivityModel->baseCount(['uid'=>$uid,'status'=>['neq', \app\common\model\LotteryActivity::STATUS_DELETE]]);
                $kaijiangActivityModel = new \app\common\model\KaijiangActivity();
                $overview['kaijiang']['activity_count'] = $kaijiangActivityModel->baseCount(['uid'=>$uid,'status'=>['neq', \app\common\model\KaijiangActivity::STATUS_DELETE]]);    
                
                $overview['last_time'] = date("Y-m-d H:i",time());
                $cacheService->setUserOverviewInfo($uid, $overview);
            }
        }
        return $overview;
    }

    /**
     * 添加用户上传图片至图库
     */   
    public function addUserPhoto($data){
        try {
            $userPhotoModel= new \app\common\model\UserPhoto();
            $id = $userPhotoModel->baseAdd($data);
            if ($id) {
                return $this->encryptId($id);;
            } else {
                s_exception('添加至图库失败');
            }
        } catch (\Exception $ex) {
            $this->rollback();
            s_exception('添加至图库失败');
        }
    }

    /**
     * 获取用户图库
     */   
    public function getUserPhoto($uid, $page = 1, $rows = 100){
        try{
            if (empty($uid)) {
                return false;
            }
            $userPhotoModel= new \app\common\model\UserPhoto();
            $res = $userPhotoModel->baseSelectPage(['uid' => $uid], ['id', 'photo'], $page, $rows, ['create_time' => 'desc']);
            foreach ($res['rows'] as &$one) {
                $one['id'] = $this->encryptId($one['id']);
            }
            return $res;
        } catch (\Exception $ex) {
            $this->rollback();
            s_exception('获取用户图库失败');
        }
    }

    /**
     * 删除用户图库
     */   
    public function delUserPhoto($uid, $ids){
        try{
            if (empty($ids) || !is_array($ids)){
                $this->ajaxError("请传入正确的ids");
            }
            foreach ($ids as $k => &$one) {
                $one = $this->decryptId($one);
            }
            $userPhotoModel= new \app\common\model\UserPhoto();
            $res = $userPhotoModel->baseDelByIds($ids);
            if ($res) {
                return true;
            } else {
                return false;
            }
        } catch (\Exception $ex) {
            $this->rollback();
            s_exception('删除用户图库失败');
        }
    }
}
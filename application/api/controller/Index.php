<?php

namespace app\api\controller;

class Index extends ApiWrap
{
    public function __construct(\think\Request $request = null)
    {
        $this->_sourceKey = input("post.source_key","vote");
        $this->_env = input('env', $this->_sourceKey);        
        parent::__construct($request);
    }

    public function index(){
        echo " Joker ";
    }

    /**
     * 检查ticket是否有效
     * 暂未使用
     */
    public function checkTicket(){
        $res = parent::checkTicket();
        $this->ajaxSuccess(['res'=>$res]);
    }

    /**
     * 获取二维码
     * text ：文本内容
     * w：需要的二维码宽高 100 200 300 最大1000
     * useage:
     * http://domain/api/index/qrcode?w=500&text=http%3a%2f%2fwww.huodongju.com%3fq%3djm%26b%3dstarry
     */
    public function qrcode()
    {
        $text = input("get.text", '');
        $width = input("get.w", 300);
        $sourceKey = input("source_key");

        if (!empty($text)) {
//            $text = urldecode($text);
            $text = htmlspecialchars_decode($text);
            $level = "M";
            if ($width) {
                $size = getQrcodeSizeByWidth($width, $level);
            } else {
                $size = input("get.size", 4);
            }
            $margin = 1;
            //        $text  = "http://www.huodongju.com/";
            header("Content-type: image/png;charset=utf-8");
            $tempFilename = './qrcode/qrcode_' . time(). rand(0, 1000) . '.png';
            qrcodePng($text, $size, $margin, $level, $tempFilename);
            
            vendor("think-image.src.Image");
            $qrImage = \think\Image::open($tempFilename);
            $qrImage_w = $qrImage->width();

            $logoPrefix = ($sourceKey == 'hdj') ? "hdj" : "yyzs";
            $logoUrl = './qrcode/'.$logoPrefix.'_logo_500.png';
            $logoImage = \think\Image::open($logoUrl);
            $logoThumbUrl = './qrcode/'.$logoPrefix.'_logo_'.time(). rand(1000, 9999).'.png';
            $logoWidth = min([500,round($qrImage_w / 4)]);
            $logoImage->thumb($logoWidth,$logoWidth)->save($logoThumbUrl,"png",90);
            
            $qrImage->water($logoThumbUrl, \think\Image::WATER_CENTER)->save($tempFilename,"png");
            echo file_get_contents($tempFilename);            
            unlink($tempFilename);
            unlink($logoThumbUrl);
            exit;
        } else {
            $this->ajaxSuccess("empty");
        }
    }

    /**
     * 获取正式服务端的access_token
     */
    public function getReleaseAccessToken()
    {
        if(config('app_status') != 'release'){
            $this->ajaxError("not release api.");
        }
        $secret = 'joker-official-account-key';
        $secretKey = input('secret_key','');
        if (empty($secretKey)){
            $this->ajaxError("secret key empty.");
        }
        if ($secretKey != $secret){
            $this->ajaxError("secret key failed.");
        }

        $WxOfficialAccountService = new \app\common\service\WxOfficialAccountService();
        $accessToken = $WxOfficialAccountService->getWeChatAccessToken();
        if ($accessToken){
            $this->ajaxSuccess([
                'access_token' =>$accessToken
            ]);
        }
        $this->ajaxError("access token empty.");
    }

    /**
     * 意见反馈
     *  需求与建议
     * 创建活动问题
     * 活动模板问题
     * 操作使用问题
     * 商务合作问题
     * 其他问题
     */
    public function feedback()
    {
        $data = input("data");
        if (!empty($data)) {
            $dataArray = json_decode($data, true);
            if (json_last_error()) {
                $this->ajaxError("数据错误,请稍后再试");
            }
        } else {
            $dataArray = input("post.");
        }

        $validate = [
            "content" => "require",
        ];
        $message = [
            "content" => "请填写反馈内容"
        ];
        $res = $this->validate($dataArray, $validate, $message);
        if (true !== $res) {
            $this->ajaxError($res);
        }
        $dataArray['user_id'] = $this->getUid();
        $indexService = new \app\common\service\IndexService();
        if ($indexService->addFeedback($dataArray)) {
            $this->ajaxSuccess();
        }
        $this->ajaxError("系统错误，请稍后再试");
    }

    /**
     * 举报投诉
     */
    public function report()
    {
        $data = input("data");
        if (!empty($data)) {
            $dataArray = json_decode($data, true);
            if (json_last_error()) {
                $this->ajaxError("数据错误,请稍后再试");
            }
        } else {
            $dataArray = input("post.");
        }
        if(!empty($dataArray['activity_type'])){
            $dataArray['source_key'] = $dataArray['activity_type'];
        }

        $validate = [
            "content" => "require",
        ];
        $message = [
            "content" => "请填写举报内容"
        ];
        $res = $this->validate($dataArray, $validate, $message);
        if (true !== $res) {
            $this->ajaxError($res);
        }
        $dataArray['user_id'] = $this->getUid();
        $indexService = new \app\common\service\IndexService();
        if ($indexService->addReport($dataArray)) {
            $this->ajaxSuccess();
        }
        $this->ajaxError("系统错误，请稍后再试");
    }

    /**
     * 收集formid
     * formids ["1","2","3"]
     */
    public function saveFormid()
    {
        $data = input("post.");
        $formids = $data['formids'];
        $sourceKey = $data['source_key'];
        $this->setSourceKey($sourceKey);
//        $formids = json_decode($formids);
        if (!empty($formids)) {
            $this->updateFormId($formids);
            $this->ajaxSuccess("ok");
        }
        $this->ajaxError("fail");
    }

    /**
     * 获得帮助文档对应节点url地址
     */
    public function getHelpUrlList()
    {
        $type = input("type","");
        $sourceKey = input("source_key");
        $lastTime = input("lasttime", 0);
        $lastTime = $lastTime / 1000;
        $currentTime = time();
        $oneMonthTime = 30 * 24 * 3600;

        $force = true;//强制更新帮助文档地址列表

        if ($force || ($lastTime < ($currentTime - $oneMonthTime))) {
            $helpService = new \app\common\service\HelpService();
            if(empty($type)){
                $type = $sourceKey;
            }
            $list = $helpService->getHelpUrlList($type);
        } else {
            $list = null;
        }
        $this->ajaxSuccess($list);
    }
    
    /**
     * 获取模板配置信息
     */
    public function getTemplate(){
        $type = input("type",'vote');//活动类型 vote lottery yuyue
        $key = input("key");//模板key
        
        $templateConfig = [];
        try{
            if($type && $key){
//                $templates = config($type."_template");
                $templateService = new \app\common\service\TemplateService();
                $templates = $templateService->getTemplatesToApp($type);
                if(array_key_exists($key, $templates)){
                    $templateConfig = $templates[$key];
                }
            }
        } catch (\Exception $ex) {
        }
        $this->ajaxSuccess($templateConfig);
    }
    
    /**
     * 小程序模板消息对应的消息存储
     */
    public function getPushMsgInfo(){
        $msgId = input("id",'');
        $uid = $this->getUid();
        try{
            if($msgId){
                $msgService = new \app\common\service\MsgListService();
                $data = $msgService->getPushMsg($uid,$msgId);
                $this->ajaxSuccess($data);
            }
            $this->ajaxError("nok");
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

}
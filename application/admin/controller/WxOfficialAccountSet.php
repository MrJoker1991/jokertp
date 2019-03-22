<?php

namespace app\admin\controller;

class WxOfficialAccountSet extends AdminWrap
{
    private $_homePath = "/admin/Index/index";

    private $_menuCrumbsFirst = "活动运营助手";

    public function __construct(\think\Request $request = null)
    {       
        parent::__construct($request);
    }

    /**
     * 专题列表入口
     */
    public function topicList(){
        $menuCrumbs = array(
            "first" => $this->_menuCrumbsFirst,
            "second" => array("menuName" => "专题列表", "url" => "/Yyzs/topicList"),
        );
        $this->assign("menuCrumbs", $menuCrumbs);
//        $this->display("Yyzs/topic_list");        
        $this->display("Yyzs/topic_list_new");        
    }

        /**
         * 专题列表入口
         */
        public function topicListTest(){
            $menuCrumbs = array(
                "first" => $this->_menuCrumbsFirst,
                "second" => array("menuName" => "专题列表测试", "url" => "/Yyzs/topicListTest"),
            );
            $this->assign("menuCrumbs", $menuCrumbs);
            $this->display("Yyzs/topic_list_test");
        }
    
    /**
     * 专题列表数据
     */
    public function topicListData(){
        $postData = I("post.");
        $apiPath = "/api/Admintopic/topicListData";
        echo $this->yyzsApiRequest($apiPath, $postData);
        exit;
        
    }
    /**
     * 专题列表操作
     */
    public function topicListOp(){
        $postData = I("post.");
        $apiPath = "/api/Admintopic/topicListOp";
        $res =  $this->yyzsApiRequest($apiPath, $postData);
        $resArr = json_decode($res,true);
        if($resArr['code'] == 1){
            $this->ajaxSuccess($resArr['msg']);
        }
        
        if(isset($resArr['msg'])){
            $msg = $resArr['msg'];
        }else{
            $msg = '系统异常，更新失败';
        }
        $this->ajaxError($resArr['msg']);
    }
    
    /**
     * 专题列表页的参数格式化为文字
     */
    public function topicListSelect(){
        $select = array();
        $select['type'] = array(
            0 => "活动",
            1 => "模板",
        );
        $select['show'] = array(
            0 => "隐藏",
            1 => "显示",
        );      
        $this->echoListSelect($select);
    }      

    /**
     * 专题项目数据
     */
    public function topicItemData(){
        $postData = I("post.");
        $apiPath = "/api/Admintopic/topicItemData";
        echo $this->yyzsApiRequest($apiPath, $postData);
        exit;
        
    } 
    /**
     * 根据相关参数，自动生成路径
     */
    public function autoPath(){
        $postData = I("post.");
        $apiPath = "/api/Admintopic/autoPath";
        echo $this->yyzsApiRequest($apiPath, $postData);
        exit;
        
    }

}
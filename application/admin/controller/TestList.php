<?php

namespace app\admin\controller;

class TestList extends AdminWrap
{
    private $_menuCrumbsFirst = "列表测试";

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
            "second" => array("menuName" => "专题列表", "url" => "/admin/TestList/topicList"),
        );
        $this->assign("menuCrumbs", $menuCrumbs);
        return $this->fetch("topicList");        
    }
    
    /**
     * 专题列表数据
     */
    public function topicListData(){
        $postData = input("post.");
        try {
            $topicService = new \app\common\service\TopicService();
            $list = $topicService->getTopicListData($postData);
            echo json_encode($list);
            exit;
        } catch (\Exception $ex) {
            // $this->ajaxError($ex->getFile()."||".$ex->getLine()."||".$ex->getMessage());
            $this->ajaxError($ex->getMessage());
        }
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
        $id = input('post.id', 0);
        if (empty($id)) {
            $this->ajaxError('id为空');
        }
        try {
            $topicService = new \app\common\service\TopicService();
            $res = $topicService->getTopicItemData($id);
            $this->ajaxSuccess($res);
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
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

    /**
     * 转化列表格式化数组为字符串
     * @param array $select
     */
    protected function echoListSelect($select){
        $selectString = "";
        foreach ($select as $key => $data) {
            $selectString = '';
            foreach ($data as $index => $one) {
                $selectString .= $index . ":" . $one . ";";
            }
            $select[$key] = rtrim($selectString, ";");
        }
        echo json_encode($select);
        exit;
    }

    /**
     * 专题列表操作
     */
    public function topicListOp()
    {
        $oper = input("post.oper", null);
        if (!empty($oper)) {
            switch ($oper) {
                case 'add':
                    $this->addTopic();
                    break;
                case 'edit':
                    $this->editTopic();
                    break;
                case 'del':
                    $this->deleteTopic();
                    break;
                case 'edit_items':
                    $this->editItems();
                    break;
                default:
                    $this->ajaxError("unknown operator.");
                    break;
            }
        }else{
            $this->ajaxError("oper failed.");
        }
    }   
    
    /**
     * 添加专题
     */
    private function addTopic(){
        $data['type'] = input('type',0);
        $data['title'] = input('title','');
        $data['sub_title'] = input('sub_title','');
        $data['more_text'] = input('more_text','全部');
        $data['more_path'] = input('more_path','');
        $data['more_mta_key'] = input('more_mta_key');
        $data['order'] = input("order",100);
        $data['show'] = input("show",0);
        
        if(empty($data['title'])){
            $this->ajaxError("请填写专题名称");
        }
        if(empty($data['more_path'])){
            $this->ajaxError("请填写更多跳转路径");
        }
        
        $model = new \app\common\model\Topic();
        
        try{
            $id = $model->baseAdd($data);
            if(!empty($id)){
                $this->ajaxSuccess("添加专题成功，请在右侧编辑专题项");
            }
            $this->ajaxError("添加专题失败或已经存在");
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }
    
    
    /**
     * 编辑专题
     */
    private function editTopic(){
        $id = input("id");
        
        $data['type'] = input('type',0);
        $data['title'] = input('title','');
        $data['sub_title'] = input('sub_title','');
        $data['more_text'] = input('more_text','全部');
        $data['more_path'] = input('more_path','');
        $data['more_mta_key'] = input('more_mta_key');
        $data['order'] = input("order",100);
        $data['show'] = input("show",0);
        
        if(empty($id)){
            $this->ajaxError("id为空，请选择要编辑的专题");
        }
        if(empty($data['title'])){
            $this->ajaxError("请填写专题名称");
        }
        if(empty($data['more_path'])){
            $this->ajaxError("请填写更多跳转路径");
        }
        
        $model = new \app\common\model\Topic();
        
        try{
            $res = $model->baseUpdate(['id'=>$id], $data);
            if($res !== false){
                $topicService = new \app\common\service\TopicService();
                $topicService->deleteTopicsFromCache();                
                $this->ajaxSuccess("更新专题成功");
            }
            $this->ajaxError("更新专题失败");
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }        
    }
    
    /**
     * 删除专题
     * @return boolean
     */
    private function deleteTopic(){
        $this->ajaxError("暂时不提供删除功能，请隐藏专题即可");
//        $topicService = new \app\common\service\TopicService();
//        $topicService->deleteTopicsFromCache();        
        return false;
    }  

}
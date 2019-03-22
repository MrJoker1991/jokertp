<?php

namespace app\common\service;

class TopicService extends BaseService {

    public function __construct()
    {
        parent::__construct();
        $this->_model = new \app\admin\model\Topic();
    }

    public function getModel()
    {
        return $this->_model;
    }

    /**
     * 获取专题列表数据
     */
    public function getTopicListData($postData)
    {
        $searchData = $this->genAdminSearchData($postData);
        try {
            $list = $this->_model->baseGetPageFromJgrid($searchData['filters'], "*", $searchData['page'], $searchData['rows'], $searchData['order']);
            foreach ($list['rows'] as &$one) {
                $one['title'] = htmlspecialchars($one['title']);
                $one['sub_title'] = htmlspecialchars($one['sub_title']);
                $one['more_text'] = htmlspecialchars($one['more_text']);
            }
            return $list;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 指定专题的所有项目数据
     */
    public function getTopicItemData($topicId){
        try {
            $itemModel = new \app\admin\model\TopicItem();
            $res = $itemModel->baseSelect(['topic_id' => $topicId], "*", ["show" => "desc", 'order' => 'asc']);
            return $res;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }



}
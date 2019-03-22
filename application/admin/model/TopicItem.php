<?php

namespace app\admin\model;

use app\common\model;

class TopicItem extends \app\common\model\BaseModel
{
    private $_fields = ['id', 'topic_id', 'name', 'desc', 'pic', 'type', 'appid', 'path_type', 'aid', 'muban_key', 'path', 'mta_key', 'order', 'source', 'show', 'create_time', 'update_time'];

    public function getFields()
    {
        return $this->_fields;
    }
}
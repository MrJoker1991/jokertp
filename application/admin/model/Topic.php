<?php

namespace app\admin\model;

use app\common\model;

class Topic extends \app\common\model\BaseModel
{
    private $_fields = ['id', 'type', 'title', 'sub_title', 'more_text', 'more_path', 'more_mta_key', 'order', 'show', 'create_time', 'update_time'];

    public function getFields()
    {
        return $this->_fields;
    }
}
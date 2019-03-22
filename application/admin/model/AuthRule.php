<?php

namespace app\admin\model;

use app\common\model;

class AuthRule extends \app\common\model\BaseModel
{
    private $_fields = ['id', 'pid', 'title', 'status', 'type', 'condition', 'create_time', 'update_time'];

    public function getFields()
    {
        return $this->_fields;
    }
}
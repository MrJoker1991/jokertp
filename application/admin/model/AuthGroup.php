<?php

namespace app\admin\model;

use app\common\model;

class AuthGroup extends \app\common\model\BaseModel
{
    private $_fields = ['id', 'name', 'status', 'rules', 'create_time', 'update_time'];

    public function getFields()
    {
        return $this->_fields;
    }
}
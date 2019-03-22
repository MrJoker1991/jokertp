<?php

namespace app\admin\model;

use app\common\model;

class AuthUserGroup extends \app\common\model\BaseModel
{
    private $_fields = ['id', 'uid', 'group_id'];

    public function getFields()
    {
        return $this->_fields;
    }
}
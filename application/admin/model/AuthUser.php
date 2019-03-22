<?php

namespace app\admin\model;

use app\common\model;

class AuthUser extends \app\common\model\BaseModel
{
    private $_fields = ['id', 'uid', 'pwd', 'salt', 'type', 'nickname', 'icon', 'create_time', 'update_time'];

    public function getFields()
    {
        return $this->_fields;
    }
}
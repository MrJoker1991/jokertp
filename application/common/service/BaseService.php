<?php

namespace app\common\service;


class BaseService
{
    /**
     * id加密因子 不可变更
     */
    const ID_SALT = 0216;

    const SCALE = 61; //加密进制

    protected $_model = null;

    public function __construct()
    {
    }

    /**
     * model开启事务
     */
    public function startTrans()
    {
        if (empty($this->_model)) {
            $this->_model = new \app\common\model\BaseModel();
        }
        $this->_model->startTrans();
    }

    /**
     * model提交事务
     * @throws \think\exception\PDOException
     */
    public function commit()
    {
        if (empty($this->_model)) {
            $this->_model = new \app\common\model\BaseModel();
        }
        $this->_model->commit();
    }

    /**
     * model事务回滚
     * @throws \think\exception\PDOException
     */
    public function rollback()
    {
        if (empty($this->_model)) {
            $this->_model = new \app\common\model\BaseModel();
        }
        $this->_model->rollback();
    }

    /**
     * 平台各种id加密
     * @param int $id
     * @return string
     */
    public function encryptId($id)
    {
        $encryptId = \app\common\tool\Encrypt::decTo($id * self::ID_SALT, self::SCALE);
        return "_".$encryptId;
    }

    /**
     * 平台接收id解密
     * @param string $idString
     * @return int
     */
    public function decryptId($idString)
    {
        if(strpos($idString, "_") === 0){
            $idString = substr($idString, 1);
            return \app\common\tool\Encrypt::decFrom($idString, self::SCALE) / self::ID_SALT;
        }else{
            if (!is_numeric($idString) && is_string($idString)) {
                return \app\common\tool\Encrypt::decFrom($idString, self::SCALE) / self::ID_SALT;
            }
        }
            
        return $idString;
    }

    /**
     * 管理后台列表数据
     */
    public function genAdminSearchData($postData){
        if (empty($postData['sidx']) || empty($postData['sord'])) {
            $order = ['id' => 'desc'];
        } else {
            $order = [$postData['sidx'] => $postData['sord']];
        }

        $page = isset($postData['page']) ? empty($postData['page']) ? 1 : $postData['page'] : 1;
        $rows = isset($postData['rows']) ? empty($postData['rows']) ? 20 : $postData['rows'] : 20;

        $filters = isset($postData['filters']) ? $postData['filters'] : '';
        $filters = htmlspecialchars_decode($filters);
        $filters = json_decode($filters, true);

        return [
            'page' => $page,
            'rows' => $rows,
            'order' => $order,
            'filters' => $filters,
        ];
    }

}
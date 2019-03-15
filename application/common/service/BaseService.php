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
     * 设置redis值
     * @param $redisKey
     * @param $redisValue
     * @param int $ttl
     * @return bool
     */
    public function setRedisValue($redisKey, $redisValue, $ttl = 86400){
        return \think\Cache::set($redisKey, $redisValue, $ttl);
    }

    /**
     * 获取redis值
     * @param $redisKey
     * @return mixed
     */
    public function getRedisValue($redisKey){
        return \think\Cache::get($redisKey);
    }

    /**
     * 删除redis值
     * @param $redisKey
     * @return mixed
     */
    public function delRedisValue($redisKey){
        return \think\Cache::rm($redisKey);
    }


}
<?php
/**
 * basemodel 公共的model层
 */

namespace app\common\model;

class BaseModel extends \think\Model
{
//    protected $autoWriteTimestamp = true;

    /**
     * 通过id获取数据
     * @param int|array $ids 主键id 支持数字1和数组 [1,2,3]
     * @return null|static
     * @throws \Exception
     */
    public function baseGetByIds($ids)
    {
        try {
            return $this->get($ids);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }
    
    /**
     * 通过id获取数据
     * @param int|array $ids 主键id 支持数字1和数组 [1,2,3]
     * @return null|static
     * @throws \Exception
     */
    public function baseAllByIds($ids)
    {
        try {
            return $this->all($ids);
//            return $this->get($ids)->toArray();
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }    

    /**
     * 获取单条数据
     * @param array $where 查询条件
     * @param array|string $field ['aa','bb'] 查询字段
     * @param array $order order(['id'=>'desc','create_time'=>'desc'] 排序
     * @return array|false|\PDOStatement|string|\think\Model
     * @throws \Exception
     */
    public function baseFind($where = [], $field = "*", $order = [])
    {
        try {
            $this->field($field)->where($where);
            if (!empty($order)) {
                $this->order($order);
            }
            return $this->find();
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 查询多条数据
     * @param array $where
     * @param array|string $field ['aa','bb'] 查询字段
     * @param array $order order(['id'=>'desc','create_time'=>'desc'] 排序
     * @param int|string $limit 10、20 获取条数
     * @return false|\PDOStatement|string|\think\Collection
     * @throws \Exception
     */
    public function baseSelect($where = [], $field = "*", $order = [], $limit = '')
    {
        try {
            $this->field($field)->where($where);
            if (!empty($order)) {
                $this->order($order);
            }
            if (!empty($limit)) {
                $this->limit($limit);
            }
            return $this->select();
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 获取分页数据
     * 注意：where条件可能需要进一步扩展复杂查询，增加condition；注意相关字段的索引；
     * @param array $where
     * @param string $field *表示查询所有字段
     * @param int $page 当前页码
     * @param int $rows 每页记录数
     * @param array $order 排序信息  array("a"=>"desc",'b'=>'asc','c') 默认asc
     * @param array $group 分组信息
     * @return array
     * @throws \Exception
     */
    public function baseSelectPage($where = array(), $field = "*", $page = 1, $rows = 10, $order = array(), $group = '')
    {
        try {

            $page = ($page <= 0 || empty($page)) ? 1 : $page;
            $rows = ($rows <= 0 || empty($rows)) ? 10 : $rows;
            $order = empty($order) ? array("id" => "desc") : $order;

            $limitString = implode(',', $this->getPageLimit($page, $rows));
            $list = $this->where($where)->field($field)->order($order)->group($group)->limit($limitString)->select();
            return array(
                "currpage" => $page,
                "rows" => $list
            );
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 获取分页数据
     * 注意：where条件可能需要进一步扩展复杂查询，增加condition；注意相关字段的索引；
     * @param array $where
     * @param string $field *表示查询所有字段
     * @param int $page 当前页码
     * @param int $rows 每页记录数
     * @param array $order 排序信息  array("a"=>"desc",'b'=>'asc','c') 默认asc
     * @return array
     */
    public function baseGetPage($where = array(), $field = "*", $page = 1, $rows = 10, $order = array())
    {
        try {
            $count = $this->where($where)->count();

            $page = ($page <= 0 || empty($page)) ? 1 : $page;
            $rows = ($rows <= 0 || empty($rows)) ? 10 : $rows;
            $order = empty($order) ? array("id" => "desc") : $order;

            $totalPage = ceil($count / $rows);
            $limitString = implode(',', $this->getPageLimit($page, $rows));
            $list = $this->where($where)->field($field)->order($order)->limit($limitString)->select();
            return array(
                "currpage" => $page,
                "totalpages" => $totalPage,
                "totalrecords" => $count,
                "rows" => $list
            );
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 一对一查询
     * @param string $model 模型名
     * @param string $foreignKey 关联外键
     * @param string $localKey 当前模型主键
     * @param $where
     * @param string $field
     * @return array|false|\PDOStatement|string|\think\Model
     * @throws \Exception
     */
    public function baseRelationFind($model, $foreignKey, $localKey, $where, $field = '*')
    {
        try {
            $relation = $this->hasOne($model, $foreignKey, $localKey);
            return $relation->hasWhere($where, $field)->find();
        } catch (\Exception $ex) {
            s_exception('db baseRelationFind ERR');
        }
    }

    /**
     * 一对一查询
     * @param string $model 模型名
     * @param string $foreignKey 关联外键
     * @param string $localKey 当前模型主键
     * @param $where
     * @param string $field
     * @return false|\PDOStatement|string|\think\Collection
     * @throws \Exception
     */
    public function baseRelationSelect($model, $foreignKey, $localKey, $where, $field = '*')
    {
        try {
            $relation = $this->hasOne($model, $foreignKey, $localKey);
            return $relation->hasWhere($where, $field)->select();
        } catch (\Exception $ex) {
            s_exception('db baseRelationSelect ERR');
        }
    }

    /**
     * 一对一查询 分页数据
     * @param string $model 模型名
     * @param string $foreignKey 关联外键
     * @param string $localKey 当前模型主键
     * @param array $where 条件
     * @param string $field 查询字段
     * @param int $page 页数
     * @param int $rows 行数
     * @param array $order 排序
     * @return array
     * @throws \Exception
     */
    public function baseRelationSelectPage($model, $foreignKey, $localKey, $where, $field = '*', $page = 1, $rows = 10, $order = [])
    {
        try {
            $page = ($page <= 0 || empty($page)) ? 1 : $page;
            $rows = ($rows <= 0 || empty($rows)) ? 10 : $rows;
            $order = empty($order) ? array("create_time" => "desc") : $order;
            $limitString = implode(',', $this->getPageLimit($page, $rows));

            $relation = $this->hasOne($model, $foreignKey, $localKey);
            $list = $relation->hasWhere($where, $field)->order($order)->limit($limitString)->select();
            return array(
                "currpage" => $page,
                "rows" => $list
            );
        } catch (\Exception $ex) {
            s_exception('db baseRelationSelectPage ERR' . $ex->getMessage());
        }
    }
    
    /**
     * 一对一查询 count
     * @param string $model 模型名
     * @param string $foreignKey 关联外键
     * @param string $localKey 当前模型主键
     * @param array $where 条件
     * @return array
     * @throws \Exception
     */    
    public function baseRelationCount($model, $foreignKey, $localKey, $where)
    {
        try {
            $relation = $this->hasOne($model, $foreignKey, $localKey);
            $count = $relation->hasWhere($where, "*")->count();
            return array(
                "count" => $count
            );
        } catch (\Exception $ex) {
            s_exception('db baseRelationCount ERR' . $ex->getMessage());
        }
    }    

    /**
     * 一对多查询
     * @param string $model 模型名
     * @param string $foreignKey 关联外键
     * @param string $localKey 当前模型主键
     * @param $where
     * @param string $field
     * @return false|\PDOStatement|string|\think\Collection
     * @throws \think\Exception
     */
    public function baseHasMany($model, $foreignKey, $localKey, $where, $field = '*')
    {
        try {
            $relation = $this->hasMany($model, $foreignKey, $localKey);
            return $relation->hasWhere($where, $field)->select();
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }


    /**
     * 添加记录
     * @param $data
     * @return mixed
     * @throws \Exception
     */
    public function baseAdd($data)
    {
        try {
            unset($this->id);
            $this->isUpdate(false)->save($data);
            return $this->id;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 添加多条记录
     * @param $data
     * @return mixed
     * @throws \Exception
     */
    public function baseAddAll($data)
    {
        try {
            return $this->saveAll($data, false);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 更新记录
     * 注意：不适用于遍历中更新记录
     * @param $where
     * @param $data
     * @return $this|bool
     * @throws \Exception
     */
    public function baseUpdate($where, $data)
    {
        if (empty($where)) {
            return false;
        }
        try {
            return $this->save($data, $where);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 通过id 更新记录
     * @param $id
     * @param $data
     * @return $this|bool
     * @throws \Exception
     */
    public function baseUpdateById($id, $data)
    {
        if (empty($id)) {
            return false;
        }
        try {
            return $this->save($data, ['id' => $id]);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 循环遍历更新记录  注意baseUpdate的区别
     * @param type $data
     * @return type
     */
    public function baseUpdateForeach($data)
    {
        try {
            return $this->data($data)->isUpdate(true)->save();
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 批量更新记录
     * $data里面的数组必须包含主键
     * @param $data
     * @return $this|bool
     * @throws \Exception
     */
    public function baseUpdateAll($data)
    {
        try {
            return $this->isUpdate()->saveAll($data);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 通过主键id删除记录
     * @param $id
     * @return bool|int
     * @throws \Exception
     */
    public function baseDel($id)
    {
        if (empty($id)) {
            return false;
        }
        try {
            return $this->destroy($id);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 通过主键id删除记录
     * @param mixed $ids 主键id 支持数字1和数组 [1,2,3]
     * @return boolean|int 失败返回false
     */
    public function baseDelByIds($ids)
    {
        if (empty($ids)) {
            return false;
        }
        try {
            return $this->destroy($ids);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 通过指定条件删除记录
     * @param mixed $condition 删除条件 ['status => -1']
     * @return boolean|int 失败返回false
     */
    public function baseDelByCondition($condition)
    {
        if (empty($condition)) {
            return false;
        }
        try {
            return $this->destroy($condition);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 自增一个字段的值
     * @param array $where 数据条件
     * @param string $field 需要增长的字段
     * @param int $step 增长的值 默认1
     * @return bool|int|true
     * @throws \Exception
     */
    public function baseInc($where, $field, $step = 1)
    {
        if (empty($where)) {
            return false;
        }
        try {
            return $this->where($where)->setInc($field, $step);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 自减一个字段的值
     * @param array $where 数据条件
     * @param string $field 需要增长的字段
     * @param int $step 增长的值 默认1
     * @return bool|int|true
     * @throws \Exception
     */
    public function baseDec($where, $field, $step = 1)
    {
        if (empty($where)) {
            return false;
        }
        try {
            return $this->where($where)->setDec($field, $step);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 获取总条数
     * @param array $where
     * @param string $field
     * @return int|string
     * @throws \Exception
     */
    public function baseCount($where = array(), $field = "")
    {
        try {
            if (empty($field)) {
                return $this->where($where)->count();
            } else {
                return $this->where($where)->count($field);
            }
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }

    }

    /**
     * 获取总和
     * @param array $where
     * @param string $field
     * @return int|string
     * @throws \Exception
     */
    public function baseSum($where, $field)
    {
        try {
            return $this->where($where)->sum($field);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 获取最大值
     * @param array $where
     * @param string $field
     * @return int|string
     * @throws \Exception
     */
    public function baseMax($where, $field)
    {
        try {
            return $this->where($where)->max($field);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 原生查询语句
     * @param $sql
     * @return mixed
     * @throws \Exception
     */
    public function baseQuery($sql)
    {
        try {
            return $this->query($sql);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 原生执行语句
     * @param $sql
     * @return mixed
     * @throws \Exception
     */
    public function baseExecute($sql)
    {
        try {
            return $this->execute($sql);
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * base find for update 悲观锁
     * @param $id
     * @param string $field
     * @return array|bool|false|\PDOStatement|string|\think\Model
     * @throws \Exception
     */
    public function baseFindLock($id, $field = "*")
    {
        if (empty($id)) {
            return false;
        }
        try {
            return $this->where(['id' => $id])->field($field)->lock(true)->find();
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

    /**
     * 通过当前页码和每页数据条数，获取查询的起始及终止位置
     * @param int $page
     * @param int $rows
     * @return array
     */
    public function getPageLimit($page = 1, $rows = 10)
    {
        $limitStart = ($page - 1) * $rows;
        return array($limitStart, $rows);
    }

    /**
     * 管理后台获取分页数据 支持jgrid的参数查询
     *
     * @param array $filters filters:{"groupOp":"AND","rules":[{"field":"id","op":"eq","data":"43"}]}
     * @param string $field *表示查询所有字段
     * @param int $page 当前页码
     * @param int $rows 每页记录数
     * @param array $order 排序信息  array("a"=>"desc",'b'=>'asc','c') 默认asc
     * @return array
     */
    public function baseGetPageFromJgrid($filters = array(), $field = "*", $page = 1, $rows = 10, $order = array(), $options = [])
    {

        /**
         * 组合最小查询条件
         * @param string $op and or
         * @param strig $data search string
         * @return array
         */
        $getOneCondition = function ($op, $data) {
            $opMap = array(
                "eq" => 'eq', "ne" => "neq", 'lt' => 'lt', 'le' => 'elt', 'gt' => 'gt', 'ge' => 'egt', 'bw' => 'like',
                'bn' => 'notlike', 'ew' => 'like', 'en' => 'notlike', 'in' => 'in', 'ni' => 'not in', 'cn' => 'like', 'nc' => 'notlike'
            );
            switch ($op) {
                case 'bw':
                case 'bn':
                    $data = $data . "%";
                    break;
                case 'ew':
                case 'en':
                    $data = "%" . $data;
                    break;
                case 'cn':
                case 'nc':
                    $data = "%" . $data . "%";
                    break;
                default:
                    break;
            }
            return array($opMap[$op], $data);
        };

        $where = [];
        $whereLogic = strtolower($filters['groupOp']);
        if (!empty($filters)) {
            if (in_array($filters['groupOp'], array('AND', 'OR'))) {
                $rules = $filters['rules'];
                foreach ($rules as $one) {
                    if (isset($options['dateToTimestamp']) && in_array($one['field'], $options['dateToTimestamp'])) {
                        $one['data'] = strtotime($one['data']);
                    }
                    list($one['op'], $one['data']) = $getOneCondition($one['op'], $one['data']);
                    $where[$one['field']] = [$one['op'], $one['data']];
                }
            }
        }

        try {
            ($whereLogic == 'and') ? ($this->where($where)) : ($this->whereOr($where));
            $count = $this->count();

            $page = ($page <= 0 || empty($page)) ? 1 : $page;
            $rows = ($rows <= 0 || empty($rows)) ? 10 : $rows;
            $order = empty($order) ? array("create_time" => "desc") : $order;

            $totalPage = ceil($count / $rows);
            $limitString = implode(',', $this->getPageLimit($page, $rows));
            ($whereLogic == 'and') ? ($this->where($where)) : ($this->whereOr($where));
            $list = $this->field($field)->order($order)->limit($limitString)->select();
            return array(
                "currpage" => $page,
                "totalpages" => $totalPage,
                "totalrecords" => $count,
                "rows" => $list
            );
        } catch (\Exception $ex) {
            s_exception($ex->getMessage(), $ex->getCode());
        }
    }

}
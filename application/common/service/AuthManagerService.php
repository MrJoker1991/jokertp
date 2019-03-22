<?php

namespace app\common\service;

class AuthManagerService extends BaseService {

    public function __construct()
    {
        parent::__construct();
        $this->_model = new \app\admin\model\AuthUser();
    }

    public function getModel()
    {
        return $this->_model;
    }

    /**
     * 通过用户名获取该用户信息
     */
    public function getAuthUserInfoByUid($uid){
        if (empty($uid)) {
            return false;
        }
        try {
            
            $res = $this->_model->baseFind(['uid' => $uid], $this->_model->getFields());
            return $res;
        } catch (\Exception $ex) {
            s_exception('查找该管理员失败' . $ex->getMessage());
        }
    }

    /**
     * 通过用户名获取用户组信息
     */
    public function getAuthGroupInfoByUid($uid){
        try {
            $authUserGroupModel = new \app\admin\model\AuthUserGroup();
            $res = $authUserGroupModel->baseRelationFind('AuthGroup', 'id', 'group_id', ['AuthUserGroup.uid' => $uid], ['AuthUserGroup.uid', 'AuthUserGroup.group_id', 'AuthGroup.name', 'AuthGroup.status']);            
            return $res;
        } catch (\Exception $ex) {
            s_exception('获取用户组信息失败' . $ex->getMessage());
        }
    }

    /**
     * 获取用户列表数据
     */
    public function getUserListData($postData)
    {
        $searchData = $this->genAdminSearchData($postData);
        try {
            $list = $this->_model->baseGetPageFromJgrid($searchData['filters'], "*", $searchData['page'], $searchData['rows'], $searchData['order']);
            foreach ($list['rows'] as &$one) {
                $groupInfo = $this->getAuthGroupInfoByUid($one['uid']);
                if ($groupInfo) {
                    $one['group_id'] = $groupInfo['group_id'];
                    $one['group_status'] = $groupInfo['status'];
                }
            }
            return $list;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 新增用户组 
     */
    public function addUser($data, $groupId)
    {
        
        $authUserGroupModel = new \app\admin\model\AuthUserGroup();
        try {
            $this->startTrans();
            $res = true;
            if ($groupId) {
                $res = $authUserGroupModel->baseAdd(['uid' => $data['uid'], 'group_id' => $groupId]);
            }
            $authUserId = $this->_model->baseAdd($data);
            if ($authUserId && $res) {
                $this->commit();
                return $authUserId;
            } else {
                $this->rollback();
                s_exception('新增失败');
            }
        } catch (\Exception $ex) {
            $this->rollback();
            s_exception($ex->getMessage());
        }
    }

    /**
     * 修改用户组 
     */
    public function editUser($id, $data, $groupId)
    {
        $authUserGroupModel = new \app\admin\model\AuthUserGroup();
        try {
            $this->startTrans();
            $userGroupRes = true;
            if ($groupId) {
                $userGroupInfo = $authUserGroupModel->baseFind(['uid' => $data['uid']]);
                if ($userGroupInfo) {
                    $userGroupRes = $authUserGroupModel->baseUpdateById($userGroupInfo['id'], ['uid' => $data['uid'], 'group_id' => $groupId]);
                } else {
                    $userGroupRes = $authUserGroupModel->baseAdd(['uid' => $data['uid'], 'group_id' => $groupId]);
                }
            }
            $userRes = $this->_model->baseUpdateById($id, $data);
            if ($userGroupRes && $userRes) {
                $this->commit();
                return true;
            } else {
                $this->rollback();
                s_exception('修改用户失败');
            }            
        } catch (\Exception $ex) {
            $this->rollback();
            s_exception($ex->getMessage());
        }
    }

    /**
     * 获取用户组列表数据
     */
    public function getGroupListData($postData)
    {
        $searchData = $this->genAdminSearchData($postData);
        try {
            $authGroupModel = new \app\admin\model\AuthGroup();
            $list = $authGroupModel->baseGetPageFromJgrid($searchData['filters'], "*", $searchData['page'], $searchData['rows'], $searchData['order']);
            return $list;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 获取所有用户组列表数据
     */
    public function getAllGroup($where = [], $field = '*')
    {
        $authGroupModel = new \app\admin\model\AuthGroup();
        try {
            $list = $authGroupModel->baseSelect($where, $field);
            return $list;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 新增用户组 
     */
    public function addGroup($name, $status)
    {
        $data = [
            'name' => $name,
            'status' => $status
        ];
        $authGroupModel = new \app\admin\model\AuthGroup();
        try {
            $res = $authGroupModel->baseAdd($data);
            return $res;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 修改用户组 
     */
    public function editGroup($id, $data)
    {
        $authGroupModel = new \app\admin\model\AuthGroup();
        try {
            $res = $authGroupModel->baseUpdateById($id, $data);
            return $res;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 获取权限规则数据
     */
    public function getRuleListData($postData)
    {
        $searchData = $this->genAdminSearchData($postData);
        $authRuleModel = new \app\admin\model\AuthRule();
        try {
            $list = $authRuleModel->baseGetPageFromJgrid($searchData['filters'], "*", $searchData['page'], $searchData['rows'], $searchData['order']);
            return $list;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 获取权限规则所有父节点数据
     */
    public function getAllRulePid()
    {
        $authRuleModel = new \app\admin\model\AuthRule();
        try {
            $list = $authRuleModel->baseSelect(['pid' => 0], ['id', 'title']);;            
            return $list;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 检查父节点是否还有父节点， 目前只允许有两层父子关系
     */
    public function checkPid($authRuleModel, $data, $id = 0)
    {
        try {
            if (!empty($id) && $id == $data['pid']) {
                s_exception("修改权限规则失败：父节点不能是自己");
            }
            $res = $authRuleModel->baseFind(['id' => $data['pid']]);
            if ($res && $res['pid'] != 0) {
                s_exception("父节点" . $res['title'] . "不允许有子节点");
            }
            return true;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 新增权限规则 
     */
    public function addRule($data)
    {
        $authRuleModel = new \app\admin\model\AuthRule();
        try {
            $this->checkPid($authRuleModel, $data);
            $res = $authRuleModel->baseAdd($data);
            return $res;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 修改权限规则 
     */
    public function editRule($id, $data)
    {
        $authRuleModel = new \app\admin\model\AuthRule();
        try {
            $this->checkPid($authRuleModel, $data);
            $this->startTrans();
            $res2 = true;
            if ($data['pid'] == 0) {
                $res2 = $authRuleModel->baseUpdate(['pid' => $id], ['status' => $data['status']]);
            }
            $res1 = $authRuleModel->baseUpdateById($id, $data);          
            if ($res1 && $res2) {
                $this->commit();
                return true;
            } else {
                $this->rollback();
                return false;
            }
        } catch (\Exception $ex) {
            $this->rollback();
            s_exception($ex->getMessage());
        }
    }

    /**
     * 获取权限规则数据
     */
    public function getAllRules($groupId){
        $authRuleModel = new \app\admin\model\AuthRule();
        $authGroupModel = new \app\admin\model\AuthGroup();
        try {
            $newRules = [];
            $ruleList = $authRuleModel->baseSelect();           
            if ($ruleList) {
                $groupInfo = $authGroupModel->baseFind(['id' => $groupId], ['rules']);
                $groupRules = explode(',', $groupInfo['rules']);
                foreach ($ruleList as $one) {
                    if (in_array($one['id'], $groupRules)) {
                        $one['checked'] = true;
                    } else {
                        $one['checked'] = false;
                    }
                    if ($one['pid'] == 0) {
                        $newRules[$one['id']]['self'] = $one;
                    } else {
                        $newRules[$one['pid']]['list'][] = $one;
                    }
                }
            }
            return $newRules;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }

    /**
     * 修改权限规则 
     */
    public function updateRules($id, $data)
    {
        $authGroupModel = new \app\admin\model\AuthGroup();
        try {
            $res = $authGroupModel->baseUpdateById($id, $data);          
            return $res;
        } catch (\Exception $ex) {
            s_exception($ex->getMessage());
        }
    }


}
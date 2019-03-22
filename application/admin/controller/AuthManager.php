<?php

namespace app\admin\controller;

class AuthManager extends AdminWrap
{
    private $_menuCrumbsFirst = "系统用户管理";

    public function __construct(\think\Request $request = null)
    {       
        parent::__construct($request);
    }

    public function showConfig(){
        dump(config());
    }

    /**
     * 用户列表
     */
    public function userList(){
        $menuCrumbs = array(
            "first" => $this->_menuCrumbsFirst,
            "second" => array("menuName" => "用户列表", "url" => "/admin/AuthManager/userList"),
        );
        $this->assign("menuCrumbs", $menuCrumbs);
        return $this->fetch("userList");        
    }

    /**
     * 用户列表数据
     */
    public function getUserListData(){
        $postData = input("post.");
        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $list = $authManagerService->getUserListData($postData);
            echo json_encode($list);
            exit;
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 用户组列表操作分发入口
     */
    public function userOperation() {
        $oper = input("post.oper", null);
        if (!empty($oper)) {
            switch ($oper) {
                case 'add':
                    $this->addUser();
                    break;
                case 'edit':
                    $this->editUser();
                    break;
                case 'del':
                    $this->ajaxError("未完善" . input("post.oper") . "操作");
                    $this->delUser();
                    break;
                default:
                    $this->ajaxError("未完善" . input("post.oper") . "操作");
                    exit;
                    break;
            }
        }
    }  

    /**
     * 新增一个用户
     */
    public function addUser() {
        $data['uid'] = input("post.uid");
        $data['nickname'] = input("post.nickname");
        $pwd = input("post.pwd");
        $gruopId = input("post.group_id");

        $data['salt'] = $this->generateSalt();
        $data['pwd'] = $this->generatePassword($data['salt'], $pwd);
        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $res = $authManagerService->addUser($data, $gruopId);
            if (empty($res)) {
                $this->ajaxError("添加用户失败：" . $data['nickname']);
            } else {
                $this->ajaxSuccess("添加用户成功：" . $data['nickname']);
            }
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 编辑用户信息
     */
    public function editUser() {
        $id = input("post.id", 0);
        if (empty($id)) {
            $this->ajaxError("id 为空");
        }
        $data['uid'] = input("post.uid");
        $this->noOperateSuperAdmin($data['uid']);
        $data['nickname'] = input("post.nickname");
        $pwd = input("post.pwd");
        $gruopId = input("post.group_id");
        $data['salt'] = $this->generateSalt();
        $data['pwd'] = $this->generatePassword($data['salt'], $pwd);

        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $res = $authManagerService->editUser($id, $data, $gruopId);
            if (empty($res)) {
                $this->ajaxError("修改用户信息失败：" . $data['nickname']);
            } else {
                $this->ajaxSuccess("修改用户信息成功：" . $data['nickname']);
            }
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 删除用户
     */
    public function delUser() {
        $ids = input("post.id", '');
        $authgroupModel = new \Hdjadmin\Model\AuthgroupModel();
        if (false !== $authgroupModel->baseDelByIds($ids)) {
            $this->ajaxSuccess("删除用户组成功：".$ids);
        }
        $this->ajaxError("删除用户组失败：".$ids);
    }

    /**
     * 用户组列表入口
     */
    public function groupList(){
        $menuCrumbs = array(
            "first" => $this->_menuCrumbsFirst,
            "second" => array("menuName" => "用户组列表", "url" => "/admin/AuthManager/groupList"),
        );
        $this->assign("menuCrumbs", $menuCrumbs);
        return $this->fetch("groupList");        
    }

    /**
     * 用户组列表数据
     */
    public function getGroupListData(){
        $postData = input("post.");
        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $list = $authManagerService->getGroupListData($postData);
            echo json_encode($list);
            exit;
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 用户组列表操作分发入口
     */
    public function groupOperation() {
        $oper = input("post.oper", null);
        if (!empty($oper)) {
            switch ($oper) {
                case 'add':
                    $this->addGroup();
                    break;
                case 'edit':
                    $this->editGroup();
                    break;
                case 'del':
                    $this->ajaxError("未完善" . input("post.oper") . "操作");
                    $this->delGroup();
                    break;
                default:
                    $this->ajaxError("未完善" . input("post.oper") . "操作");
                    exit;
                    break;
            }
        }
    }

    /**
     * 新增一个用户组
     */
    public function addGroup() {
        $name = input("post.name", '');
        $status = input("post.status", 0);
        if (empty($name)) {
            $this->ajaxError("请填写用户组名称");
        }

        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $res = $authManagerService->addGroup($name, $status);
            if (empty($res)) {
                $this->ajaxError("添加用户组失败：" . $name);
            } else {
                $this->ajaxSuccess("新增成功");
            }
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 编辑用户组信息
     */
    public function editGroup() {
        $id = input("post.id");
        $name = input("post.name", '');
        $status = input("post.status", 0);
        if (empty($id)) {
            $this->ajaxError("id错误");
        }
        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $data = ['name' => $name, 'status' => $status];
            $res = $authManagerService->editGroup($id, $data);
            if (empty($res)) {
                $this->ajaxError("修改用户组信息失败：" . $name);
            } else {
                $this->ajaxSuccess("修改用户组信息成功：" . $name);
            }
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 删除用户组
     */
    public function delGroup() {
        $ids = I("post.id", '');
        $authgroupModel = new \Hdjadmin\Model\AuthgroupModel();
        if (false !== $authgroupModel->baseDelByIds($ids)) {
            $this->ajaxSuccess("删除用户组成功：".$ids);
        }
        $this->ajaxError("删除用户组失败：".$ids);
    }

    /**
     * 获取用户组各类下拉框数据
     */
    public function getGroupSelectData() {
        $type = input("post.type", "", "strtolower");
        $selectString = "";
        switch ($type) {
            case "status":
                $fromArray = [1 => "开启", 0 => "禁用"];
                foreach ($fromArray as $index => $one) {
                    $selectString .= $index . ":" . $one . ";";
                }
                break;
            case "name":
                $selectString = ":用户组;";
                $authManagerService = new \app\common\service\AuthManagerService();
                $lists = $authManagerService->getAllGroup([], ['id', 'name']);
                foreach ($lists as $one) {
                    $selectString .= $one['id'] . ":" . $one['name'] . ";";
                }
                break;
            default:
                break;
        }
        echo rtrim($selectString, ";");
        exit;
    }  

    /**
     * 权限规则列表入口
     */
    public function ruleList(){
        $menuCrumbs = array(
            "first" => $this->_menuCrumbsFirst,
            "second" => array("menuName" => "权限规则列表", "url" => "/admin/AuthManager/ruleList"),
        );
        $this->assign("menuCrumbs", $menuCrumbs);
        return $this->fetch("ruleList");        
    }

    /**
     * 获取权限规则各类下拉框数据
     */
    public function getRuleSelectData() {
        $type = input("post.type", "", "strtolower");
        $selectString = "";
        switch ($type) {
            case "status":
                $fromArray = array(1 => "开启", 0 => "禁用");
                foreach ($fromArray as $index => $one) {
                    $selectString .= $index . ":" . $one . ";";
                }
                break;
            case "pid":
                $selectString = "0:选择父节点;";
                $authManagerService = new \app\common\service\AuthManagerService();
                $res = $authManagerService->getAllRulePid();
                foreach ($res as $one) {
                    $selectString .= $one['id'] . ":" . $one['title'] . ";";
                }
                break;
            default:
                break;
        }
        echo rtrim($selectString, ";");
        exit;
    }

    /**
     * 权限规则列表数据
     */
    public function getRuleListData(){
        $postData = input("post.");
        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $list = $authManagerService->getRuleListData($postData);
            echo json_encode($list);
            exit;
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 权限规则列表操作分发入口
     */
    public function ruleOperation() {
        $oper = input("post.oper", null);
        if (!empty($oper)) {
            switch ($oper) {
                case 'add':
                    $this->addRule();
                    break;
                case 'edit':
                    $this->editRule();
                    break;
                case 'del':
                    $this->ajaxError("未完善" . input("post.oper") . "操作");
                    $this->delRule();
                    break;
                default:
                    $this->ajaxError("未完善" . input("post.oper") . "操作");
                    exit;
                    break;
            }
        }
    }

    /**
     * 新增一个权限规则
     */
    public function addRule() {
        $data['pid'] = input("post.pid");
        $data['name'] = input("post.name");
        $data['title'] = input("post.title");
        $data['status'] = input("post.status", 1);
        $data['type'] = input("post.type", 1);

        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $res = $authManagerService->addRule($data);
            if (empty($res)) {
            } else {
                $this->ajaxSuccess("成功添加权限规则：" . $data['title']);
            }
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 编辑权限规则信息
     */
    public function editRule() {
        $id = input("post.id");
        if (empty($id)) {
            $this->ajaxError("id错误");
        }
        $data['pid'] = input("post.pid");
        $data['name'] = input("post.name");
        $data['title'] = input("post.title");
        $data['status'] = input("post.status", 1);
        $data['type'] = input("post.type", 1);
        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $res = $authManagerService->editRule($id, $data);
            if (empty($res)) {
                $this->ajaxError("修改权限规则信息失败：" . $data['title']);
            } else {
                $this->ajaxSuccess("修改权限规则信息成功：" . $data['title']);
            }
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 删除用户
     */
    public function delRule() {
        $ids = input("post.id", '');
        $authgroupModel = new \Hdjadmin\Model\AuthgroupModel();
        if (false !== $authgroupModel->baseDelByIds($ids)) {
            $this->ajaxSuccess("删除用户组成功：".$ids);
        }
        $this->ajaxError("删除用户组失败：".$ids);
    }

    /**
     * 获取所有权限规则
     */
    public function getAllRules() {
        $id = input("post.id");
        if (empty($id)) {
            $this->ajaxError("获取所有权限规则失败，用户组不存在");
        }
        try {
            $authManagerService = new \app\common\service\AuthManagerService();
            $list = $authManagerService->getAllRules($id);
            return $this->ajaxSuccess($list);
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }

    /**
     * 获取所有权限规则
     */
    public function updateRules() {
        $id = input("post.id");
        if (empty($id)) {
            $this->ajaxError("id为空");
        }
        $rules = input("post.rules");
        try {
            $data = ['rules' => $rules];
            $authManagerService = new \app\common\service\AuthManagerService();
            $res = $authManagerService->updateRules($id, $data);
            if ($res) {
                $this->ajaxSuccess($res);
            } else {
                $this->ajaxError("更新失败");
            }
        } catch (\Exception $ex) {
            $this->ajaxError($ex->getMessage());
        }
    }



    /**
     * 不允许操作超级管理员任何信息
     * @param type $uid
     */
    private function noOperateSuperAdmin($uid){
        if(trim($uid) == $this->superAdminUid){
            $this->ajaxError("不允许修改超级管理员，请联系管理人员");
        }
    }
}
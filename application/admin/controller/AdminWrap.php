<?php

namespace app\admin\controller;

use app\common\controller\Base;

/**
 * 管理后台基类
 */
class AdminWrap extends Base {

    /**
     * JS版本号
     */
    private $_version = '20190401';

    /**
     * 手动设置cookie时间
     */
    const COOKIE_LIFE_TIME = 7200;

    /**
     * super admin uid
     * @var string 
     */
    protected $superAdminUid = "superadmin";
    
    /**
     * 操作密码
     * @var type 
     */
    private $_operation_pwd = "superdo";

    /**
     * 当前用户信息
     * @var array 
     */
    private $_userInfo = null;
    
    /**
     * 新布局需要一个全局变量数据对象
     * @var type 
     */
    private $_gData = [];



    /**
     * 管理后台继承类
     */
    public function __construct() {
        parent::__construct();
        header("Content-Type:text/html; charset=utf-8");
        if ($this->allowAccess() || $this->checkLogin()) {
            $this->_userInfo = $this->getUserInfo();
            $this->assign("user", array('username' => $this->_userInfo['nickname'], 'uid' => $this->_userInfo['uid']));
        } else {
            if (request()->isAjax()) {
                $this->ajaxError("<a href='" . url('admin/Index/login') . "'>请重新登录</a>");
            }
            $this->error('请重新登录', url('admin/Index/login'));
        }
        $this->assign('version', $this->_version);
    }

    /**
     * 是否可以直接访问
     * 在confi配置文件中直接配置
     * @return boolean
     */
    private function allowAccess() {
        $allowAccessModule = config("ALLOW_ACCESS_MODULE");
        $controller = request()->controller();
        $action = request()->action();
        if (array_key_exists($controller, $allowAccessModule)) {
            if ($allowAccessModule[$controller] == "*") {
                return true;
            } elseif (in_array(strtolower($action), $allowAccessModule[$controller])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检测是否拥有功能模块权限
     * 超级管理员特殊处理
     * @todo  后续去除admin
     * @param string $uid uid
     */
    private function checkRightRule($uid) {
        if ($uid == $this->superAdminUid || $uid == 'admin') {
            return true;
        }
        $auth = new \app\common\service\CheckAuthService();
//        $rule_name = MODULE_NAME . '/' . CONTROLLER_NAME . '/' . ACTION_NAME;
        $rule_name = request()->controller().'/'.request()->action();
        if (!$auth->check($rule_name, $uid)) {
            if (request()->isAjax()) {
                $this->ajaxError("目前不具备该功能权限");
            } else {
                $this->error('目前不具备该功能权限');
            }
        }
    }

    /**
     * 检测终端ip是否在指定ip范围内
     * @return boolean
     */
    private function checkAccessIp() {
        $remoteIp = I("server.REMOTE_ADDR");
        $remoteIpInt = ip2long($remoteIp);
        $allowAccessIp = C("ALLOW_ACCESS_IP");
        foreach ($allowAccessIp as $key => $value) {
            if ("section" == $key) {
                foreach ($value as $one) {
                    $startIpInt = ip2long($one['start']);
                    $endIpInt = ip2long($one['end']);
                    if ($remoteIpInt >= $startIpInt && $remoteIpInt <= $endIpInt) {
                        return true;
                    }
                }
            }
            if ("in" == $key && in_array($remoteIp, $value)) {
                return true;
            }
        }
        $this->error($remoteIp . '不在IP范围内', U('Warehouse/Admin/login'));
    }

    /**
     * 检查登录状态
     * 目前考虑每次验证都需查验数据库
     * @param boolean $writeSession 是否写入session，第一次登录时写入,其他地方暂时不能写入
     * @return boolean
     */
    protected function checkLogin($writeSession = false) {
       // $this->checkAccessIp();
        if ($writeSession) {
            $uid = input('post.uid', input('get.uid'), "trim");
            $pwd = input('post.password', input('get.password'), "trim");
        } else {
            $sessionUserInfo = $this->getUserInfo();
            $uid = $sessionUserInfo['uid'];
            $pwd = $sessionUserInfo['pwd'];
        }

        $authManagerService = new \app\common\service\AuthManagerService();
        $userInfo = $authManagerService->getAuthUserInfoByUid($uid);
        if ($writeSession) {
            $pwd = $this->generatePassword($userInfo['salt'], $pwd);
        }
        if (!empty($uid) && !empty($pwd) && ($pwd == $userInfo['pwd'])) {
            if ($writeSession) {
                session('userId', $userInfo['id']);
                $this->sessionUserInfo($userInfo);
            }
            $this->checkRightRule($uid);
            return true;
        }
        return false;
    }

    /**
     * 获取随机salt
     * @return string
     */
    protected function generateSalt() {
        $type = 0;
        $length = 6;
        $arr = array(1 => "0123456789", 2 => "abcdefghijklmnopqrstuvwxyz", 3 => "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 4 => "~@#$%^&*(){}[]|");
        if ($type == 0) {
            //不需要特殊符号
            array_pop($arr);
            $string = implode("", $arr);
        } elseif ($type == "-1") {
            //所有符号
            $string = implode("", $arr);
        } else {
            //指定符号 1 2 3 4
            $string = $arr[$type];
        }
        $count = strlen($string) - 1;
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $string[rand(0, $count)];
        }
        return $code;
    }

    /**
     * user pwd rule
     * @param type $salt
     * @param type $pwd
     * @return type
     */
    protected function generatePassword($salt, $pwd) {
        return md5($salt . $pwd);
    }

    /**
     * user openid rule
     * @param type $uid
     * @return type
     */
    protected function generateOpenId($uid) {
        return md5($uid . time());
    }

    /**
     * 当前菜单是否展开
     * @param type $menu
     * @return boolean
     */
    private function _isMenuOpen($menu) {
        if (isset($menu['submenu'])) {
            foreach ($menu['submenu'] as $menu) {
                if ($menu['select'] || $this->_isMenuOpen($menu)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 输出左侧导航菜单html
     * @param type $menu
     * @return string
     */
    private function _outputMenuHtml($menu) {
        $menu['url'] = isset($menu['url']) ? $menu['url'] : '';
        $menu['target'] = isset($menu['target']) ? $menu['target'] : '';
        $menu['icon'] = isset($menu['icon']) ? $menu['icon'] : '';
        // $menu['url'] = isset($menu['url']) ? $menu['url'] : '';
        $activeHtml = isset($menu['select']) && $menu['select'] ? 'class="active"' : '';
        // 判断是否展开
        $openHtml = '';
        $submenudisplay = '';
        if (isset($menu['select']) && !$menu['select']) {
            $openHtml = $this->_isMenuOpen($menu) ? 'class="open"' : '';
            $submenudisplay = empty($openHtml) ? '' : 'style="display:block"';
        }

        $styleHtml = '';
        $str = '<li %s %s %s ><a href="%s" target="%s" class="dropdown-toggle"><i class="%s"></i><span class="menu-text">%s</span>';
        $str = sprintf($str, $openHtml, $activeHtml, $styleHtml, $menu['url'], $menu['target'], $menu['icon'], $menu['title']);
        if (isset($menu['submenu']) &&count($menu['submenu']) > 0) {
            // 存在子节点
            $str = $str . '<b class="arrow icon-angle-down"></b></a><ul class="submenu" ' . $submenudisplay . '>';
            foreach ($menu['submenu'] as $submenu) {
                $str = $str . $this->_outputMenuHtml($submenu);
            }
            $str = $str . '</ul></li>';
        } else {
            $str = $str . "</a></li>";
        }
        return $str;
    }

    /**
     * 选中某个菜单
     * @param type $path
     * @param type $menus
     * @return boolean
     */
    public function selectMenu($path, $menus) {
        // 遍历所有菜单，将指定$title置为选中
        foreach ($menus as $key => $menu) {
            if (isset($menus[$key]['submenu']) && count($menus[$key]['submenu']) > 0) {
                $menus[$key]['submenu'] = $this->selectMenu($path, $menus[$key]['submenu']);
                if($this->hasSelectSubMenu($menus[$key]['submenu'])){
                    $menus[$key]['select'] = true;
                    return $menus;
                }
            }
            $menus[$key]['select'] = false;
            if (isset($menus[$key]['path'])) {
                foreach ($menus[$key]['path'] as $k => $v) {
                    $path = str_replace("_", "", $path);
                    if (0 == strcasecmp($v, $path)) {
                        $menus[$key]['select'] = true;
                    }
                }
            }
        }

        return $menus;
    }
    
    /**
     * 判断自己的子级菜单是否有选中
     * @param type $menus
     * @return boolean
     */
    private function hasSelectSubMenu($menus){
        foreach ($menus as $menu){
            if($menu['select']){
                return true;
            }
        }
        return false;
    }

    /**
     * 重写模板fetch渲染
     * @param type $templateFile
     * @param type $charset
     * @param type $contentType
     * @param type $content
     * @param type $prefix
     */
    protected function fetch($template = '', $vars = [], $replace = [], $config = []) {
        // 生成菜单
        $menusConfig = config('menu');
        $menus = $menusConfig['menus'];
        // $nowAction = '/'.request()->controller().'/'.request()->action();
        $nowPath = '/'.request()->path();
        $menus = $this->selectMenu($nowPath, $menus);
        //旧布局
        $templateConfig = config('template');
        if($templateConfig['layout_name'] == 'layout'){
            $str = '<ul class="nav nav-list">';
            foreach ($menus as $menu) {
                $str = $str . $this->_outputMenuHtml($menu);
            }
            $str = $str . '</ul>';
            $this->assign("menus", $str);
        }else{
            $gData = $this->getgData();
            $gData['user'] = array('username' => $this->_userInfo['nickname'], 'uid' => $this->_userInfo['uid']);
            $gData['menus'] = $menus;
            $this->setgData($gData);
            $this->assign("gData", json_encode($this->getgData(), JSON_UNESCAPED_UNICODE));
        }
        $this->assign("admin_version", $this->_version);
        // $qiniuConfig = C("PLATFORM_QINIU");
        // $this->assign("publicImageDomain", $qiniuConfig['PublicDomain']);
        // $this->assign("privateImageDomain", $qiniuConfig['PrivateDomain']);
        // $this->assign("bbs",$bbs);
        return parent::fetch($template = '', $vars = [], $replace = [], $config = []);
    }

    /**
     * 组合所有查询条件
     * @return array
     */
    protected function getSearchCondition($options=array()) {
        $options  = empty($options) ? array("dateToTimestamp"=>false) : $options;
        //filters:{"groupOp":"OR","rules":[{"field":"id","op":"eq","data":"1"},{"field":"category_id","op":"ne","data":"123"}]}
        //_search:true
        $condition = array();
        if (I("param._search", '')) {
            $filters = I("param.filters", '', 'htmlspecialchars_decode');
            if (!empty($filters)) {
                $filters = json_decode($filters, true);
                if (in_array($filters['groupOp'], array('AND', 'OR'))) {
                    $condition['_logic'] = $filters['groupOp'];
                    $rules = $filters['rules'];
                    foreach ($rules as $one) {
                        if($options['dateToTimestamp'] && in_array($one['field'], $options['dateToTimestamp'])){
                            $one['data'] = strtotime($one['data']);
                        }
                        if (!empty($condition[$one['field']])) {
                            //相同字段至少有2个条件以上
                            if (is_array($condition[$one['field']][0])) {
                                $condition[$one['field']][] = $this->getOneCondition($one['op'], $one['data']);
                            } else {
                                //相同字段已经有一个条件
                                $tmpArray = $condition[$one['field']];
                                unset($condition[$one['field']]);
                                $condition[$one['field']][] = $tmpArray;
                                $condition[$one['field']][] = $this->getOneCondition($one['op'], $one['data']);
                            }
                        } else {
                            //相同字段的第一个条件
                            $condition[$one['field']] = $this->getOneCondition($one['op'], $one['data']);
                        }
                    }
                    foreach($condition as $field=>$one){
                        if(is_array($one[0])){
                            $condition[$field][] = $condition['_logic'];
                        }
                    }
//                    print_r($condition);exit;
                }
            }
        }
        return $condition;
    }

    /**
     * 组合最小查询条件
     * @param string $op and or
     * @param strig $data search string
     * @return array
     */
    protected function getOneCondition($op, $data) {
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
    }
    
    /**
     * 替换tp查询 where条件中 城市名称为城市id
     * @param type $where
     * @return type
     */
    public function replaceCitySearchCondition($where){
        if($where['city']){
            if(is_array($where['city'][0])){
                foreach($where['city'] as $index=>$one){
                    if(is_array($one)){
                        $where['city'][$index][1]= Address::getCityId($one[1]);
                    }
                }
            }else{
                $where['city'][1] = Address::getCityId($where['city'][1]);
            }
        }   
        return $where;
    }

    /**
     * 检查操作密码
     * @param type $pwd
     * @return boolean
     */
    protected function checkOperationPwd($pwd) {
        if ($this->_operation_pwd == trim($pwd)) {
            return true;
        }
        return false;
    }

    /**
     * 获取当前登录用户信息
     * @return array
     */
    protected function getUserInfo() {
        return unserialize(base64_decode(session("userInfo")));
    }

    /**
     * 保存当前用户信息到session中
     * @param array $userInfo
     */
    protected function sessionUserInfo($userInfo) {
        session("userInfo", base64_encode(serialize($userInfo)));
    }

    /**
     * 导出CSV文件
     * @param $filename
     * @param $data
     */
    protected function exportCsv($filename, $data)
    {
        header("Content-type:text/csv;charset=UTF-8");
        header("Content-Disposition:attachment;filename=".$filename);
        header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
        header('Expires:0');
        header('Pragma:public');
        echo $data;
    }
    
    /**
     * 兼容处理新旧版本活动须知数据结构
     * 旧：纯文本  新：json字符串
     * @param type $activityInfo
     * @return type
     */
    protected function getNotice($activityInfo) {
        if (trim($activityInfo['notice']) == '') {
            return '';
        }
        $noticeArray = json_decode($activityInfo['notice'], true);
        if (json_last_error()) {
            $noticeArray = array(
                'content' => $activityInfo['notice'],
            );
        }
        return $noticeArray;
    }

    /**
     * 导出数据对一些换行或者符号做处理
     * @param $value
     * @return mixed
     */
    public function exportDataString($value) {
        $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c", ",", "-", "+");
        $replacements = array("\\\\", "\\/", "\\\"", "", "", "\\t", "\\f", "\\b", "，", '－', "＋");
        $result = str_replace($escapers, $replacements, $value);
        return $result;
    }
    
    /**
     * 设置新布局后端下发通用数据对象
     * 注意：请先get后插入所需数据到gData对象后，再set
     * eg
        $gData = $this->getgData();
        $gData['menu'] = $menu;
        $this->setgData($gData);
     * @param type $data
     */
    public function setgData($data){
        $this->_gData = $data;
    }
    /**
     * get gData
     * @return type
     */
    public function getgData(){
        return $this->_gData;
    }

}

<?php
return [
    'default_controller'     => 'Index',
    'default_action'         => 'login',

    'template'  =>  [
        'layout_on'     =>  true,
        'layout_name'   =>  'layout',
        'layout_item'   =>  '{__CONTENT__}',
        'view_path'     =>  ''
    ],

    'view_replace_str'  => [
        '__ADMINSTATIC__' => '/static/admin',
        '__FONTSTATIC__' => '/static/font',
        '__PLUGINSTATIC__' => '/static/plugin',
        '__COMMONSTATIC__' => '/static/common'
    ],

    'AUTH_CONFIG' => [
        'AUTH_ON' => true, //认证开关
        'AUTH_TYPE' => 1, // 认证方式，1为时时认证；2为登录认证。
        'AUTH_GROUP' => 'jie_auth_group', //用户组数据表名
        'AUTH_GROUP_ACCESS' => 'jie_auth_user_group', //用户组明细表
        'AUTH_RULE' => 'jie_auth_rule', //权限规则表
        'AUTH_USER' => 'jie_auth_ser', //用户信息表
    ],
];
<?php
return [
    'menus' => [
        [
            'title' => '首页',
            'icon' => 'icon-home',
            'submenu' => [
                [
                    'path' => array('/admin/Index/index'),
                    'url' => '/admin/Index/index',
                    'title' => '欢迎页'
                ],
                [
                   'path' => array('/admin/Yytj/indexdb', '/admin/Yytj/detaildb'),
                    'url' => '/admin/Yytj/indexdb',
                    'title' => '汇总' 
                ],
            ],
        ],
        [
            'title' => '微信公众号',
            'icon' => 'icon-h-sign',
            'submenu' => [
                [
                    'path' => array('/admin/Index/index'),
                    'url' => '/admin/Index/index',
                    'title' => '欢迎页'
                ],
                [
                   'path' => array('/admin/Yytj/indexdb', '/admin/Yytj/detaildb'),
                    'url' => '/admin/Yytj/indexdb',
                    'title' => '汇总' 
                ],
            ],
        ],
        [
            'title' => '列表测试',
            'icon' => 'icon-tasks',
            'submenu' => [
                [
                    'path' => array('/admin/TestList/topicList'),
                    'url' => '/admin/TestList/topicList',
                    'title' => '首页专题设置'
                ],
            ],
        ],
        [
            'title' => '系统用户管理',
            'icon' => 'icon-group',
            'submenu' => array(
                array(
                    'path' => array('/admin/AuthManager/userList'),
                    'url' => '/admin/AuthManager/userList',
                    'title' => '用户列表'
                ),
                array(
                    'path' => array('/admin/AuthManager/groupList'),
                    'url' => '/admin/AuthManager/groupList',
                    'title' => '用户组列表'
                ),
                array(
                    'path' => array('/admin/AuthManager/ruleList'),
                    'url' => '/admin/AuthManager/ruleList',
                    'title' => '权限规则列表'
                ),
            )
        ],
    ]
];
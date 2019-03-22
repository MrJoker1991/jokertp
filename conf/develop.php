<?php

return [
    // 应用调试模式
    'app_debug'              => true,


    //数据库配置
    'database'=>[
        // 数据库类型
        'type'            => 'mysql',
        // 服务器地址
        'hostname'        => '192.168.139.132',
        // 数据库名
        'database'        => 'dev',
        // 用户名
        'username'        => 'root',
        // 密码
        'password'        => 'dbpasswd',
        // 端口
        'hostport'        => '',
        // 连接dsn
        'dsn'             => '',
        // 数据库连接参数
        'params'          => [],
        // 数据库编码默认采用utf8mb4 支持emoji标签
        'charset'         => 'utf8mb4',
        // 数据库表前缀
        'prefix'          => 'jie_',
        // 数据库调试模式
        'debug'           => true,
        // 数据库部署方式:0 集中式(单一服务器),1 分布式(主从服务器)
        'deploy'          => 0,
        // 数据库读写是否分离 主从式有效
        'rw_separate'     => false,
        // 读写分离后 主服务器数量
        'master_num'      => 1,
        // 指定从服务器序号
        'slave_no'        => '',
        // 是否严格检查字段是否存在
        'fields_strict'   => false,
        // 数据集返回类型
        'resultset_type'  => 'array',
        // 自动写入时间戳字段
        'auto_timestamp'  => true,
        // 时间字段取出后的默认时间格式
        'datetime_format' => false,
        // 是否需要进行SQL性能分析
        'sql_explain'     => false,        
    ],
    //Redis配置
    'cache' => [
        // 驱动方式
        'type' => 'redis',
        // 服务器地址
        'host' => '127.0.0.1',
        // redis端口
        'port' => 6379,
        // 密码
        'password' => '',
        // 操作库
        'select' => 0,
        // 缓存前缀
        'prefix' => '',
        // 缓存有效期 0表示永久缓存
        'expire' => 86400,
        // 是否长连接
        'persistent' => true,
        // sessionkey前缀
        'session_name' => 'jie_',
    ],
    //公众号相关配置
    'official_account_config' => [
        'appid' => 'wx7acc3a6f66f1689d',
        'appsecret' => '4b379aba2cbfa52b355518124e65bebd',
        'token' => 'joker',
        'encoding_aes_key' => '4uMBkQY5tOpwmc4tEtaSd5Js2bem9gCQXbrue7Yq96y'
    ],
];
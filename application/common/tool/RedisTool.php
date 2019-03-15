<?php

namespace app\common\tool;

class RedisTool {

    /**
     * 存储实例数组
     * 
     * @var array
     */
    private static $_instance = array();

    /**
     * 获取实例
     * 
     * @param array $server array('host' => 'redis.host.com', 'port' => 6379)
     * @param boolean $persistent 是否使用长连接，建议使用短连接
     * @return \Redis
     */
    public static function getInstance($server = array(), $persistent = false) {
        $redisConfig = config("cache");

        if (empty($server) || !is_array($server)) {
            $db = $redisConfig['select'];
            $server = array("host" =>$redisConfig['host'] , 'port' => $redisConfig['port'], 'auth' => $redisConfig['password'],"db"=>($db?$db:0));
        }
        $key = $persistent ? $server['host'] . ":" . $server['port'] . ":persistent" : $server['host'] . ":" . $server['port'];

        if (!isset(self::$_instance[$key]) || empty(self::$_instance[$key])) {
            self::init($server, $persistent);
        }
        return self::$_instance[$key];
    }

    /**
     * 初始化连接
     * 
     * @param array $server  redis服务配置
     * @param type $persistent 是否长连接，默认短连接
     * @throws Exception
     */
    private static function init($server = array(), $persistent = false) {
        $instance = new \Redis();
        try {
            if (!$persistent) {
                $connect = $instance->connect($server['host'], $server['port'], 3);
            } else {
                $connect = $instance->pconnect($server['host'], $server['port'], 3);
            }
            if (isset($server['auth']) && !empty($server['auth'])) {
                $instance->auth($server['auth']);
            }
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
//            print_r($e->getMessage());
//            exit;
        }
        if (!$connect) {
            throw new \Exception('Cannot connect cache server. Host:' . $server['host']);
        }
        $key = $persistent ? $server['host'] . ":" . $server['port'] . ":persistent" : $server['host'] . ":" . $server['port'];
        $instance->select($server['db']);
        self::$_instance[$key] = $instance;
        register_shutdown_function(array('\app\common\tool\RedisTool', 'close'), $server);
    }

    /**
     * 关闭连接
     */
    public static function close($server = array()) {
        if (!empty($server) && is_array($server)) {
            $key = $server['host'] . ":" . $server['port'];
            $instance = self::$_instance[$key];
            if ($instance) {
                $instance->close();
                unset(self::$_instance[$key]);
            }
        }
    }


}
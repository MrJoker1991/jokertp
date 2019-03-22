<?php

namespace app\common\service;

/**
 * Description of VoteCacheService
 * 相关的redis设置与获取服务
 * 不建议在外部业务逻辑层直接调用redis相关方法设置或获取
 * 
 * @author joker
 */
class CacheService extends BaseService
{
    /**
     * 设置redis值
     * @param $redisKey
     * @param $redisValue
     * @param int $ttl
     * @return bool
     */
    public static function setRedisValue($redisKey, $redisValue, $ttl = 86400){
        return \think\Cache::set($redisKey, $redisValue, $ttl);
    }

    /**
     * 获取redis值
     * @param $redisKey
     * @return mixed
     */
    public static function getRedisValue($redisKey){
        return \think\Cache::get($redisKey);
    }

    /**
     * 删除redis值
     * @param $redisKey
     * @return mixed
     */
    public static function delRedisValue($redisKey){
        return \think\Cache::rm($redisKey);
    }

    /**
     * 判断是否存在该key
     * @param $redisKey
     * @return mixed
     */
    public static function hasRedisKey($redisKey){
        return \think\Cache::has($redisKey);
    }

    /**
     * 获取缓存微信公众号 AccessToken 信息(包含过期时间)
     * @param $wxAppId
     * @return array|mixed
     */
    public static function getOfficialAccountAccessToken($wxAppId = '') {
        $key = \app\common\tool\RedisKey::JIE_OFFICIAL_ACCOUNT_ACCESS_TOKEN_ . $wxAppId;
        if (self::hasRedisKey($key)) {
            $value = self::getRedisValue($key);
            $accessToken = json_decode($value);
            return $accessToken;
        } else {
            //本地环境从远程取
            if (config('app_status') != 'office') {
                $postUrl = config('release_domain').'api/index/getReleaseAccessToken';
                $res = \app\common\tool\HttpTool::post($postUrl, [
                    'secret_key' => 'joker-official-account-key'
                ]);
                $resJson = json_decode($res, true);
                if ($resJson['code'] != -1) {
                    $accessToken = json_decode($resJson['data']['access_token']);
                    self::setOfficialAccountAccessToken($wxAppId, $accessToken);
                    return $accessToken;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        return false;
    }

    /**
     * 缓存微信公众号 AccessToken信息(包含过期时间)
     * @param $wxAppId
     * @param $accessToken
     * @return bool
     */
    public static function setOfficialAccountAccessToken($wxAppId, $accessToken, $ttl = 7200) {
        $key = \app\common\tool\RedisKey::JIE_OFFICIAL_ACCOUNT_ACCESS_TOKEN_ . $wxAppId;
        $value = json_encode($accessToken);
        $res = self::setRedisValue($key, $value, $ttl);
        return $res;
    }

    /**
     * 删除微信公众号 AccessToken信息(包含过期时间)
     * @param $wxAppId
     * @return boolean
     */
    public static function delOfficialAccountAccessToken($wxAppId = '') {
        $key = \app\common\tool\RedisKey::JIE_OFFICIAL_ACCOUNT_ACCESS_TOKEN_ . $wxAppId;
        if ($this->hasRedisKey($key)) {
            return $this->delRedisValue($key);
        }
        return false;
    }

    /**
     * 获取缓存微信公众号 Ticket 信息(包含过期时间)
     * @param $wxAppId
     * @return array|mixed
     */
    public static function getOfficialAccountAccessTicket($wxAppId = '') {
        $key = \app\common\tool\RedisKey::JIE_OFFICIAL_ACCOUNT_ACCESS_TOKEN_ . $wxAppId;
        if ($this->hasRedisKey($key)) {
            $value = $this->getRedisValue($key);
            $accessToken = json_decode($value);
            return $accessToken;
        }
        return false;
    }

    /**
     * 缓存微信公众号 Ticket 信息(包含过期时间)
     * @param $wxAppId
     * @param $accessToken
     * @return bool
     */
    public static function setOfficialAccountAccessTicket($wxAppId, $accessToken, $ttl = 7200) {
        $key = \app\common\tool\RedisKey::JIE_OFFICIAL_ACCOUNT_ACCESS_TOKEN_ . $wxAppId;
        $value = json_encode($accessToken);
        $res = $this->setRedisValue($key, $value, $ttl);
        return $res;
    }

    /**
     * 删除微信公众号 Ticket 信息(包含过期时间)
     * @param $wxAppId
     * @return boolean
     */
    public static function delOfficialAccountAccessTicket($wxAppId = '') {
        $key = \app\common\tool\RedisKey::JIE_OFFICIAL_ACCOUNT_ACCESS_TOKEN_ . $wxAppId;
        if ($this->hasRedisKey($key)) {
            return $this->delRedisValue($key);
        }
        return false;
    }
}
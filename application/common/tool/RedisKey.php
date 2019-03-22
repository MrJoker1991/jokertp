<?php

namespace app\common\tool;

/**
 * 项目用到的redis所有key，config也可以配置前缀
 *
 * Class RedisKey
 * @package app\common\tool
 */
class RedisKey
{
    const DEFAULT_EXPIRE_TIME = 2592000; // 86400 * 30

    /**
     * 版本名 参考
     * string
     */
    const JIE_STRING_VERSION_NAME = 'jie_string_version_name';

    /**
     * test for joker
     */
    const JIE_STRING_TEST = 'jie_string_test_';

    /**
     * 公众号Access Token
     */
    const JIE_OFFICIAL_ACCOUNT_ACCESS_TOKEN_ = 'jie_official_account_access_token_';

    /**
     * 公众号 Ticket 
     */
    const JIE_OFFICIAL_ACCOUNT_ACCESS_TICKET_ = 'jie_official_account_access_ticket_';



}
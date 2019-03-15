<?php
namespace app\index\controller;

class Index
{
    public function index()
    {
error_log("jjjjjjjjjjj\n",3,'/tmp/joker.log');
        $res = config('INDEX_CONF');
        dump($res);
    }
}
// oaPxbw8kGH0XCxtxiwvDW0pAxT0M
